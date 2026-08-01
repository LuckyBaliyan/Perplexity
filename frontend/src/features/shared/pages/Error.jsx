import { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import { useNavigate } from "react-router";

/**
 * Error Page
 * @returns React Component
*/

const RESEND_VERIFICATION_ENDPOINT = `${import.meta.env.BACKEND_URL}/api/auth/resend-verification-email`;

/**
 * Reads the raw error payload coming back from the login / register API
 * and turns it into the copy + log lines the terminal screen displays.
 *
 * Handles the shapes the auth API returns:
 *  - validation failure:   { success, message: "Validation Failed", data: { errors: [...] } }
 *  - missing token:        { message: "Unauthorized", success, err: "No token provided" }
 *  - bad credentials:      { message: "Invalid Credentials", success, err: "invalid credentials" }
 *  - unverified account:   { message: "Account not verified", success, err: "account not verified", data: { email } }
 *  - account not found:    { message: "user not found", success, err: "user not found" }
 *  - duplicate account:    { message: "User with same name or email already exists", success, err: "user already exsist" }
 */
function parseAuthError(error) {
      if (!error) {
            return {
                  code: "000",
                  status: "SIGNAL_LOST",
                  title: "No Response From Core",
                  description:
                        "The authentication gateway did not return a diagnosable response. The request may have been interrupted before it reached the server.",
                  logs: [
                        { level: "SYSTEM", text: "Awaiting handshake response...", tone: "warn" },
                        { level: "ADVISORY", text: "Re-attempt authentication or contact system admin", tone: "info" },
                  ],
            };
      }

      // Validation failure — field level errors
      const fieldErrors = error?.data?.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length) {
            return {
                  code: "422",
                  status: "VALIDATION_FAILURE",
                  title: "Credentials Rejected",
                  description:
                        "The gateway parsed your submission but one or more fields failed validation. Correct the fields below and resubmit.",
                  logs: [
                        {
                              level: "SYSTEM",
                              text: `Validating ${fieldErrors.length} field${fieldErrors.length > 1 ? "s" : ""}...`,
                              tone: "warn",
                        },
                        ...fieldErrors.map((e) => ({
                              level: (e.path || "FIELD").toUpperCase(),
                              text: e.msg,
                              tone: "error",
                        })),
                        { level: "ADVISORY", text: "Correct highlighted fields and resubmit", tone: "info" },
                  ],
            };
      }

      // Missing / invalid token
      if (error?.message === "Unauthorized") {
            return {
                  code: "401",
                  status: "ACCESS_DENIED",
                  title: "Session Not Authenticated",
                  description:
                        "The gateway could not verify an active session for this request. Your token may be missing or expired.",
                  logs: [
                        { level: "SYSTEM", text: "Attempting handshake with session token... FAIL", tone: "error" },
                        { level: "GATEWAY", text: error?.err || "No token provided", tone: "error" },
                        { level: "ADVISORY", text: "Re-authenticate to restore access", tone: "info" },
                  ],
            };
      }

      // Wrong email / password
      if (error?.message === "Invalid Credentials") {
            return {
                  code: "401",
                  status: "AUTH_REJECTED",
                  title: "Invalid Credentials",
                  description:
                        "The email and password combination submitted does not match any active record in the identity core.",
                  logs: [
                        { level: "SYSTEM", text: "Attempting handshake with identity core... FAIL", tone: "error" },
                        { level: "IDENTITY", text: error?.err || "invalid credentials", tone: "error" },
                        { level: "ADVISORY", text: "Verify credentials and retry", tone: "info" },
                  ],
            };
      }

      // Account exists but email never confirmed — this one gets an
      // interactive resend flow instead of just a message + button.
      if (error?.err === "account not verified" || error?.message === "Account not verified") {
            return {
                  code: "403",
                  status: "VERIFICATION_REQUIRED",
                  title: "Account Not Verified",
                  description:
                        "Your account exists but the email address on file hasn't been confirmed yet. Resend the activation link below to continue.",
                  logs: [
                        { level: "SYSTEM", text: "Identity confirmed, verification flag unset", tone: "warn" },
                        { level: "GATEWAY", text: error?.err || "account not verified", tone: "error" },
                        { level: "ADVISORY", text: "Resend the activation link to proceed", tone: "info" },
                  ],
                  variant: "verify",
                  prefilledEmail: error?.data?.email || "",
            };
      }

      // No account matches (login on unregistered email, or a stale session lookup)
      if (error?.err === "user not found" || error?.message === "user not found" || error?.message === "User not found") {
            return {
                  code: "404",
                  status: "IDENTITY_NOT_FOUND",
                  title: "No Matching Account",
                  description:
                        "No account was found for the credentials submitted. Double check the email, or register a new account.",
                  logs: [
                        { level: "SYSTEM", text: "Identity lookup returned no record", tone: "warn" },
                        { level: "ADVISORY", text: "Check the email or create a new account", tone: "info" },
                  ],
            };
      }

      // Registering with an email/username already taken
      if (error?.err === "user already exsist" || /already exists/i.test(error?.message || "")) {
            return {
                  code: "409",
                  status: "ACCOUNT_EXISTS",
                  title: "Account Already Registered",
                  description:
                        "An account with this email or username is already registered. Log in instead, or use a different email to register.",
                  logs: [
                        { level: "SYSTEM", text: "Duplicate identity detected during registration", tone: "warn" },
                        { level: "ADVISORY", text: "Log in with the existing account instead", tone: "info" },
                  ],
            };
      }

      // Anything unrecognized
      return {
            code: "500",
            status: "TERMINAL_ERROR",
            title: error?.message || "Unexpected Terminal Error",
            description: "The gateway returned a response that could not be classified. Details are logged below.",
            logs: [
                  { level: "SYSTEM", text: "Unhandled response from identity core", tone: "warn" },
                  { level: "RAW", text: error?.err || JSON.stringify(error), tone: "error" },
                  { level: "ADVISORY", text: "Contact system admin if this persists", tone: "info" },
            ],
      };
}

const TONE_COLOR = {
      error: "text-[var(--color-error)]",
      warn: "text-[var(--accent-primary)]",
      info: "text-[var(--text-secondary)]",
};

/**
 * @description LoadingScreen — Renders temporary loading layout while session is being verified.
 * @returns {React.ReactElement} Loading screen element.
 */
function LoadingScreen() {
      return (
            <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)] font-[Geist,sans-serif] flex flex-col">
                  <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[var(--border-strong)]/40">
                        <div className="flex items-center gap-3">
                              <span className="text-xl font-bold tracking-tight">Perplexor AI</span>
                              <span className="text-[11px] font-[JetBrains_Mono,monospace] tracking-widest uppercase px-2 py-1 rounded border border-[var(--border-strong)] text-[var(--accent-primary)]">
                                    System
                              </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-[JetBrains_Mono,monospace] tracking-widest uppercase text-[var(--text-secondary)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
                              SESSION_ESTABLISHED
                        </div>
                  </header>

                  <main className="flex-1 flex flex-col items-center justify-center px-6">
                        <div className="relative w-20 h-20">
                              <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
                              <div
                                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-primary)] animate-spin"
                                    style={{ filter: "drop-shadow(0 0 12px rgba(173,198,255,0.6))" }}
                              />
                        </div>

                        <p className="mt-8 text-[12px] md:text-sm font-[JetBrains_Mono,monospace] tracking-[0.3em] uppercase text-[var(--accent-primary)]">
                              Access Granted
                        </p>

                        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center">
                              Establishing Secure Session
                        </h1>

                        <p className="mt-4 max-w-md text-center text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                              Identity confirmed by the core. Routing you to your dashboard now.
                        </p>
                  </main>

                  <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 md:px-10 py-6 border-t border-[var(--border-strong)]/30 text-[13px] text-[var(--text-muted)]">
                        <span>
                              <span className="text-[var(--accent-primary)]">NeonAI</span> Systems &nbsp;|&nbsp; © 2026 NeonAI Systems. All rights reserved.
                        </span>
                  </footer>
            </div>
      );
}

/**
 * @description ResendVerificationPanel — Inline resend verification link component.
 * @param {Object} props - Prefilled email address prop.
 * @returns {React.ReactElement} Verification panel element.
 */
function ResendVerificationPanel({ prefilledEmail }) {
      const [email, setEmail] = useState(prefilledEmail || "");
      const [status, setStatus] = useState("idle"); // idle | loading | sent | error
      const [feedback, setFeedback] = useState("");

      /**
       * @description Triggers email resend verification API request.
       * @returns {Promise<void>}
       */
      async function handleResend() {
            if (!email) {
                  setStatus("error");
                  setFeedback("Enter the email you registered with.");
                  return;
            }

            setStatus("loading");
            setFeedback("");

            try {
                  const response = await fetch(
                        `${RESEND_VERIFICATION_ENDPOINT}?email=${encodeURIComponent(email)}`,
                        { method: "GET", credentials: "include" }
                  );
                  const body = await response.json().catch(() => ({}));

                  if (!response.ok) {
                        setStatus("error");
                        setFeedback(body?.message || "Could not resend the verification link.");
                        return;
                  }

                  setStatus("sent");
                  setFeedback(`Verification link sent to ${email}. Check your inbox.`);
            } catch (err) {
                  setStatus("error");
                  setFeedback("Network error — check your connection and try again.");
            }
      }

      return (
            <div className="mt-10 w-full max-w-md">
                  <label className="block text-[11px] font-[JetBrains_Mono,monospace] tracking-widest uppercase text-[var(--text-muted)] mb-2">
                        Account Email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                        <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="flex-1 rounded bg-[var(--bg-inset)]/80 backdrop-blur-xl border border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] px-4 py-3 text-sm font-[JetBrains_Mono,monospace] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition"
                        />
                        <button
                              onClick={handleResend}
                              disabled={status === "loading"}
                              className="shrink-0 cursor-pointer px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-[var(--text-inverse)] font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              style={{ boxShadow: "0 0 24px rgba(173,198,255,0.35)" }}
                        >
                              {status === "loading" ? "Sending..." : "Resend Link"}
                        </button>
                  </div>

                  {feedback && (
                        <p
                              className={`mt-3 text-sm font-[JetBrains_Mono,monospace] ${status === "sent" ? "text-[var(--accent-secondary)]" : "text-[var(--color-error)]"
                                    }`}
                        >
                              {feedback}
                        </p>
                  )}
            </div>
      );
}

/**
 * @description Error Page — Cyber-Modern Intelligence terminal error screen using design system variables.
 * @returns {React.ReactElement} Error page component.
 */
export default function Error() {
      const error = useSelector((state) => state.auth.error);
      const user = useSelector((state) => state.auth.user);
      const navigate = useNavigate();
      const content = parseAuthError(error);

      useEffect(() => {
            if (user) {
                  const timeout = setTimeout(() => navigate("/dashboard", { replace: true }), 800);
                  return () => clearTimeout(timeout);
            }
      }, [user, navigate]);

      if (user) {
            return <LoadingScreen />;
      }

      return (
            <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)] font-[Geist,sans-serif] flex flex-col">
                  {/* Top bar */}
                  <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[var(--border-strong)]/40">
                        <div className="flex items-center gap-3">
                              <span className="text-xl font-bold tracking-tight">Perplexor AI</span>
                              <span className="text-[11px] font-[JetBrains_Mono,monospace] tracking-widest uppercase px-2 py-1 rounded border border-[var(--border-strong)] text-[var(--accent-primary)]">
                                    System
                              </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-[JetBrains_Mono,monospace] tracking-widest uppercase text-[var(--text-secondary)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-error)] animate-pulse" />
                              {content.status}_V4.0
                        </div>
                  </header>

                  {/* Main */}
                  <main className="flex-1 flex flex-col items-center px-6 py-16 md:py-24">
                        <div
                              className="text-[96px] md:text-[160px] leading-none font-extrabold text-[var(--accent-primary)]"
                              style={{ textShadow: "0 0 60px rgba(173,198,255,0.35)" }}
                        >
                              {content.code}
                        </div>

                        <p className="mt-6 text-[12px] md:text-sm font-[JetBrains_Mono,monospace] tracking-[0.3em] uppercase text-[var(--accent-primary)]">
                              {content.status.replace(/_/g, " ")}
                        </p>

                        <h1 className="mt-4 text-3xl md:text-5xl font-bold text-[var(--text-primary)] text-center">
                              {content.title}
                        </h1>

                        <p className="mt-5 max-w-xl text-center text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
                              {content.description}
                        </p>

                        {/* Panels */}
                        <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5">
                              {/* Status card */}
                              <div className="rounded bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-strong)]/30 p-6">
                                    <div className="flex items-center justify-between">
                                          <span className="text-[12px] font-[JetBrains_Mono,monospace] tracking-widest uppercase text-[var(--text-secondary)]">
                                                Status
                                          </span>
                                          <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={1.5}
                                                      d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7V7z"
                                                />
                                          </svg>
                                    </div>
                                    <div className="mt-6 h-1.5 w-full rounded-full bg-[var(--border-default)] overflow-hidden">
                                          <div className="h-full bg-[var(--accent-primary)] rounded-full" style={{ width: "34%" }} />
                                    </div>
                                    <p className="mt-3 text-sm text-[var(--text-secondary)] font-[JetBrains_Mono,monospace]">
                                          Auth Core Load: 34%
                                    </p>
                              </div>

                              {/* Diagnostic report */}
                              <div className="rounded bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-strong)]/30 p-6">
                                    <div className="flex items-center gap-2 text-[12px] font-[JetBrains_Mono,monospace] tracking-widest uppercase text-[var(--text-secondary)]">
                                          <svg className="w-4 h-4 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                                          </svg>
                                          Diagnostic Report
                                    </div>
                                    <div className="mt-4 rounded bg-[var(--bg-inset)] border border-[var(--border-strong)]/30 p-4 space-y-1.5 font-[JetBrains_Mono,monospace] text-[13px] max-h-48 overflow-y-auto">
                                          {content.logs.map((log, i) => (
                                                <p key={i} className="text-[var(--text-secondary)]">
                                                      <span className="text-[var(--text-muted)]">{"> "}</span>
                                                      <span className="text-[var(--text-primary)]">[{log.level}]</span>{" "}
                                                      <span className={TONE_COLOR[log.tone] || "text-[var(--text-secondary)]"}>{log.text}</span>
                                                </p>
                                          ))}
                                    </div>
                              </div>
                        </div>

                        {/* Unverified accounts get the resend widget instead of just a button */}
                        {content.variant === "verify" && (
                              <ResendVerificationPanel prefilledEmail={content.prefilledEmail} />
                        )}

                        {/* Actions */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                              <button
                                    onClick={() => navigate("/login")}
                                    className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-[var(--text-inverse)] font-semibold hover:brightness-110 transition"
                                    style={{ boxShadow: "0 0 24px rgba(173,198,255,0.35)" }}
                              >
                                    Return to Login
                              </button>
                        </div>
                  </main>

                  {/* Footer */}
                  <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 md:px-10 py-6 border-t border-[var(--border-strong)]/30 text-[13px] text-[var(--text-muted)]">
                        <span>
                              <span className="text-[var(--accent-primary)]">NeonAI</span> Systems &nbsp;|&nbsp; © 2026 NeonAI Systems. All rights reserved.
                        </span>
                        <div className="flex gap-6">
                              <a href="#" className="hover:text-[var(--text-primary)] transition">
                                    Privacy Policy
                              </a>
                              <a href="#" className="hover:text-[var(--text-primary)] transition">
                                    Terms of Service
                              </a>
                              <a href="#" className="hover:text-[var(--text-primary)] transition">
                                    Documentation
                              </a>
                        </div>
                  </footer>
            </div>
      );
}
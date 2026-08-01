import React, { useMemo, useState, useRef, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate, Navigate } from "react-router";

import { VscAccount } from "react-icons/vsc";
import useReveal from "../../animations/hooks/useReveal";
import { useAuth } from "../hooks/useAuth.js";
import { useSelector } from "react-redux";
import Loader from "../../shared/pages/Loader.jsx";

/**
 * Register
 * "Cyber-Modern Intelligence" design-system tokens are applied via Tailwind
 * arbitrary values pulled straight from design.md (colors, radii, type scale)
 * so this screen stays visually consistent with Login while using the
 * system's secondary (neon green) accent for its primary action, per spec:
 * "Secondary (Neon Green): Reserved for success states, secondary highlights,
 * and 'on' indicators" — here used for the identity-creation CTA.
 */

// --- Icons (inline SVG, no external deps) ---
/**
 * @description UserIcon — SVG icon component for user profile/name inputs.
 * @param {Object} props - Component properties.
 * @returns {React.ReactElement} SVG user icon.
 */
const UserIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
      </svg>
);

/**
 * @description AtIcon — SVG icon component for email address inputs.
 * @param {Object} props - Component properties.
 * @returns {React.ReactElement} SVG at-sign icon.
 */
const AtIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-4 7.5" strokeLinecap="round" />
      </svg>
);

/**
 * @description LockIcon — SVG icon component for password security inputs.
 * @param {Object} props - Component properties.
 * @returns {React.ReactElement} SVG lock icon.
 */
const LockIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <rect x="5" y="10.5" width="14" height="9" rx="1.5" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" strokeLinecap="round" />
      </svg>
);

/**
 * @description BoltIcon — SVG icon component for button highlights.
 * @param {Object} props - Component properties.
 * @returns {React.ReactElement} SVG bolt icon.
 */
const BoltIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" {...props}>
            <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6Z" />
      </svg>
);

/**
 * @description BoltMarkIcon — SVG icon component for branded badge markings.
 * @param {Object} props - Component properties.
 * @returns {React.ReactElement} SVG bolt mark icon.
 */
const BoltMarkIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" {...props}>
            <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6Z" strokeLinejoin="round" />
      </svg>
);

/**
 * @description ShieldIcon — SVG icon component for security and encryption badges.
 * @param {Object} props - Component properties.
 * @returns {React.ReactElement} SVG shield icon.
 */
const ShieldIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3" {...props}>
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      </svg>
);

/**
 * @description Calculates a heuristic entropy/strength score (0 to 3) for a password string.
 * @param {string} value - Password string to analyze.
 * @returns {number} Calculated entropy score.
 */
function strengthOf(value) {
      if (!value) return 0;
      let score = 0;
      if (value.length >= 6) score++;
      if (value.length >= 10) score++;
      if (/[^a-zA-Z0-9]/.test(value) || /\d/.test(value)) score++;
      return Math.min(score, 3);
}

/**
 * @description Register UI Component for new user registration with password entropy meter.
 * @returns {React.ReactElement} Register page component.
 */
export default function Register() {
      const [username, setUserName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [submitted, setSubmitted] = useState(false);

      const registerCardRef = useRef(null);
      /**
       * @description Register UI Animation reveal configuration.
       * @returns {void}
      */
      useReveal(registerCardRef, { delay: 0, yfrom: 40, yto: 0, duration: 1 });

      const strength = useMemo(() => strengthOf(password), [password]);
      const strengthLabel = ["", "WEAK ENTROPY", "MODERATE ENTROPY", "SECURE ENTROPY"][strength];

      const user = useSelector(state => state.auth.user);
      const loading = useSelector(state => state.auth.loading);
      const error = useSelector(state => state.auth.error);
      const navigate = useNavigate();

      const theme = useSelector(state => state.theme.value);

      const { handleRegister } = useAuth();

      /**
       * @description Resets user registration form fields.
       * @returns {void}
       */
      const cleanUp = () => {
            setUserName("");
            setEmail("");
            setPassword("");
            setSubmitted(false);
      }


      /**
       * @description Submits the user registration form, dispatches registration action, and redirects to login on success.
       * @param {Event} e - Form submission event.
       * @returns {Promise<void>}
       */
      const handleSubmit = async (e) => {
            e.preventDefault();
            const data = await handleRegister({
                  username,
                  email,
                  password,
            });

            if (data.success) {
                  /*alert(data.message + `Please verify your account via link send 
                        on registered email! before logging in!`);*/
                  cleanUp();
                  navigate("/login", { replace: true });
            }
      };

      if (loading) {
            return <Loader />
      }

      if (!loading && user) {
            return <Navigate to="/dashboard" replace />
      }


      return (
            <div className="min-h-screen w-full bg-[var(--bg-app)] relative overflow-hidden flex flex-col font-sans">
                  {/* ambient background layers */}
                  {theme === "dark" ?
                        (
                              <div className="pointer-events-none absolute inset-0">
                                    {/* soft overall vignette so the center lifts slightly off pure app background */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,35,50,0.35)_0%,_rgba(0,0,0,0)_55%)]" />

                                    {/* faint indigo glow seated behind the card/header */}
                                    <div className="absolute top-[16%] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[110px]" />

                                    {/* green glow bleeding out from behind the card's bottom-left corner */}
                                    <div className="absolute top-[64%] left-[30%] h-[380px] w-[380px] rounded-full bg-lime-500/10 blur-[100px]" />

                                    {/* subtle wash to lift the top-right corner slightly off pure background */}
                                    <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-slate-500/5 blur-[120px]" />
                              </div>
                        )
                        :
                        (
                              <div className="pointer-events-none absolute inset-0">
                                    {/* soft overall vignette so the center lifts slightly off pure app background */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,87,34,0.06)_0%,_rgba(255,255,255,0)_55%)]" />

                                    {/* faint orange glow seated behind the card/header */}
                                    <div className="absolute top-[16%] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[110px]" />

                                    {/* soft warm-gray glow bleeding out from behind the card's bottom-left corner */}
                                    <div className="absolute top-[64%] left-[30%] h-[380px] w-[380px] rounded-full bg-stone-400/10 blur-[100px]" />

                                    {/* subtle wash to lift the top-right corner slightly off pure background */}
                                    <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-neutral-300/10 blur-[120px]" />
                              </div>
                        )

                  }

                  {/* main card */}
                  <div ref={registerCardRef} className="relative z-10 flex-1 flex items-center justify-center px-4">
                        <div className={`w-full max-w-md rounded-xl bg-[var(--bg-surface)]/90 backdrop-blur-2xl p-8 ${theme === "dark" ? "shadow-[0_0_60px_rgba(0,0,0,0.6)]" : "border-[1.5px] border-[#c7c5c58e] bg-[#c7c5c58e]"}`}>
                              {/* header row */}
                              <div className="flex items-center justify-between">
                                    {/* logo */}
                                    <div className="relative flex justify-center mb-6">
                                          <VscAccount className="w-15 h-15 text-[var(--accent-secondary)]" />
                                    </div>
                                    <div className="w-full text-center">
                                          <h1 className="text-3xl font-bold tracking-[-0.01em] text-[var(--text-primary)]">
                                                Create Your Account
                                          </h1>
                                          <p className="m-4 mt-2 text-sm text-[var(--text-secondary)]">
                                                Join the Perplexor ecosystem and experience the future of intelligence.
                                          </p>
                                    </div>
                              </div>

                              {/* form */}
                              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                                    <Input
                                          label="Username"
                                          icon={<UserIcon />}
                                          placeholder="Johnathan Doe"
                                          value={username}
                                          onChange={(e) => setUserName(e.target.value)}
                                          className="[&>label]:font-mono [&>label]:text-[11px] [&>label]:tracking-[0.1em] [&>label]:text-[var(--text-secondary)]"
                                          inputClassName="!text-[var(--text-primary)]"
                                    />

                                    <Input
                                          label="Email Address"
                                          icon={<AtIcon />}
                                          type="email"
                                          placeholder="neural@neonai.systems"
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          className="[&>label]:font-mono [&>label]:text-[11px] [&>label]:tracking-[0.1em] [&>label]:text-[var(--text-secondary)]"
                                          inputClassName="!text-[var(--text-primary)]"
                                    />

                                    <div className="flex flex-col gap-2">
                                          <Input
                                                label="Password"
                                                icon={<LockIcon />}
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="[&>label]:font-mono [&>label]:text-[11px] [&>label]:tracking-[0.1em] [&>label]:text-[var(--text-secondary)]"
                                                inputClassName="!text-[var(--text-primary)] tracking-widest"
                                          />

                                          {/* strength meter */}
                                          <div className="flex items-center gap-3 pt-1">
                                                <div className="flex flex-1 gap-1.5">
                                                      {[0, 1, 2].map((i) => (
                                                            <div
                                                                  key={i}
                                                                  className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? "bg-[var(--accent-secondary)]" : "bg-[var(--border-default)]"
                                                                        }`}
                                                            />
                                                      ))}
                                                </div>
                                                <span className="shrink-0 font-mono text-[10px] tracking-[0.08em] text-[var(--accent-secondary)]">
                                                      {strengthLabel || "ENTER PHRASE"}
                                                </span>
                                          </div>
                                    </div>

                                    <Button
                                          type="submit"
                                          variant="primary"
                                          className="mt-2 !rounded-lg !bg-[var(--accent-secondary)] hover:!brightness-110 !text-[var(--bg-app)]
                                          !font-mono !text-sm
                                          !tracking-[0.08em] !py-3.5"
                                    >
                                          <span className="uppercase">Create Account</span>
                                          <BoltIcon />
                                    </Button>
                              </form>

                              {/* footer link */}
                              <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-[var(--accent-primary)] hover:underline">Log In</Link>
                              </p>
                        </div>
                  </div>

                  {/* bottom encryption strip */}
                  <div className="relative z-10 flex items-center justify-center gap-2 pb-8">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                              <ShieldIcon />
                        </span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]">
                              <LockIcon className="h-2.5 w-2.5" />
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--text-muted)]">
                              ENCRYPTED BY AES-256 NEURAL LOCK
                        </span>
                  </div>
            </div>
      );
}
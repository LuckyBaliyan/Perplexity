import React, { useMemo, useState, useRef } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

import { VscAccount } from "react-icons/vsc";
import useReveal from "../../animations/hooks/useReveal";

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
const UserIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
      </svg>
);

const AtIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-4 7.5" strokeLinecap="round" />
      </svg>
);

const LockIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <rect x="5" y="10.5" width="14" height="9" rx="1.5" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" strokeLinecap="round" />
      </svg>
);

const BoltIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" {...props}>
            <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6Z" />
      </svg>
);

const BoltMarkIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" {...props}>
            <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6Z" strokeLinejoin="round" />
      </svg>
);

const ShieldIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3" {...props}>
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      </svg>
);

/** Very small heuristic strength score, purely for the visual meter (0-3). */
function strengthOf(value) {
      if (!value) return 0;
      let score = 0;
      if (value.length >= 6) score++;
      if (value.length >= 10) score++;
      if (/[^a-zA-Z0-9]/.test(value) || /\d/.test(value)) score++;
      return Math.min(score, 3);
}

/**
 * @description Register UI
 * @returns React Component
 */

export default function Register() {
      const [fullName, setFullName] = useState("");
      const [intelligenceId, setIntelligenceId] = useState("");
      const [securityPhrase, setSecurityPhrase] = useState("");

      const registerCardRef = useRef(null);
      /**
       * @description Register UI Animation
       * @returns React Component
      */
      useReveal(registerCardRef, { delay: 0, yfrom: 40, yto: 0, duration: 1 });

      const strength = useMemo(() => strengthOf(securityPhrase), [securityPhrase]);
      const strengthLabel = ["", "WEAK ENTROPY", "MODERATE ENTROPY", "SECURE ENTROPY"][strength];

      const handleSubmit = (e) => {
            e.preventDefault();
            console.log({ fullName, intelligenceId, securityPhrase });
      };

      return (
            <div className="min-h-screen w-full bg-black relative overflow-hidden flex flex-col font-sans">
                  {/* ambient background layers */}
                  <div className="pointer-events-none absolute inset-0">
                        {/* soft overall vignette so the center lifts slightly off pure black */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,35,50,0.35)_0%,_rgba(0,0,0,0)_55%)]" />

                        {/* faint indigo glow seated behind the card/header */}
                        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[110px]" />

                        {/* green glow bleeding out from behind the card's bottom-left corner */}
                        <div className="absolute top-[64%] left-[30%] h-[380px] w-[380px] rounded-full bg-lime-500/10 blur-[100px]" />

                        {/* subtle wash to lift the top-right corner slightly off pure black */}
                        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-slate-500/5 blur-[120px]" />
                  </div>

                  {/* main card */}
                  <div ref={registerCardRef} className="relative z-10 flex-1 flex items-center justify-center px-4">
                        <div className="w-full max-w-md rounded-xl  bg-[#121414]/90 backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
                              {/* header row */}
                              <div className="flex items-center justify-between">
                                    {/* logo */}
                                    <div className="relative flex justify-center mb-6">
                                          <VscAccount className="w-15 h-15 text-[#9df800]" />
                                    </div>
                                    <div className="w-full text-center">
                                          <h1 className="text-3xl font-bold tracking-[-0.01em] text-[#e2e2e2]">
                                                Create Your Account
                                          </h1>
                                          <p className="m-4 mt-2 text-sm text-[#c1c6d7]">
                                                Join the Perplexor ecosystem and experience the future of intelligence.
                                          </p>
                                    </div>
                              </div>

                              {/* form */}
                              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                                    <Input
                                          label="Full Name"
                                          icon={<UserIcon />}
                                          placeholder="Johnathan Doe"
                                          value={fullName}
                                          onChange={(e) => setFullName(e.target.value)}
                                          className="[&>label]:font-mono [&>label]:text-[11px] [&>label]:tracking-[0.1em] [&>label]:text-[#c1c6d7]"
                                          inputClassName="!text-[#e2e2e2]"
                                    />

                                    <Input
                                          label="Intelligence ID"
                                          icon={<AtIcon />}
                                          type="email"
                                          placeholder="neural@neonai.systems"
                                          value={intelligenceId}
                                          onChange={(e) => setIntelligenceId(e.target.value)}
                                          className="[&>label]:font-mono [&>label]:text-[11px] [&>label]:tracking-[0.1em] [&>label]:text-[#c1c6d7]"
                                          inputClassName="!text-[#e2e2e2]"
                                    />

                                    <div className="flex flex-col gap-2">
                                          <Input
                                                label="Security Phrase"
                                                icon={<LockIcon />}
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={securityPhrase}
                                                onChange={(e) => setSecurityPhrase(e.target.value)}
                                                className="[&>label]:font-mono [&>label]:text-[11px] [&>label]:tracking-[0.1em] [&>label]:text-[#c1c6d7]"
                                                inputClassName="!text-[#e2e2e2] tracking-widest"
                                          />

                                          {/* strength meter */}
                                          <div className="flex items-center gap-3 pt-1">
                                                <div className="flex flex-1 gap-1.5">
                                                      {[0, 1, 2].map((i) => (
                                                            <div
                                                                  key={i}
                                                                  className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? "bg-[#9df800]" : "bg-[#333535]"
                                                                        }`}
                                                            />
                                                      ))}
                                                </div>
                                                <span className="shrink-0 font-mono text-[10px] tracking-[0.08em] text-[#9df800]">
                                                      {strengthLabel || "ENTER PHRASE"}
                                                </span>
                                          </div>
                                    </div>

                                    <Button
                                          type="submit"
                                          variant="primary"
                                          className="mt-2 !rounded-lg !bg-[#9df800] hover:!bg-[#8bdc00] !text-[#102000]
                                          !shadow-[0_0_30px_rgba(157,248,0,0.35)] !font-mono !text-sm
                                          !tracking-[0.08em] !py-3.5"
                                    >
                                          <span className="uppercase">Create Account</span>
                                          <BoltIcon />
                                    </Button>
                              </form>

                              {/* footer link */}
                              <p className="mt-6 text-center text-sm text-[#c1c6d7]">
                                    Already have an account?{" "}
                                    <Button variant="link" type="button" className="!text-[#adc6ff] hover:!text-[#d8e2ff]" url="login">
                                          Log In
                                    </Button>
                              </p>
                        </div>
                  </div>

                  {/* bottom encryption strip */}
                  <div className="relative z-10 flex items-center justify-center gap-2 pb-8">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4b8eff]/20 text-[#adc6ff]">
                              <ShieldIcon />
                        </span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#9df800]/20 text-[#9df800]">
                              <LockIcon className="h-2.5 w-2.5" />
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.1em] text-[#8b90a0]">
                              ENCRYPTED BY AES-256 NEURAL LOCK
                        </span>
                  </div>
            </div>
      );
}
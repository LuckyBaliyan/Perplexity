import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Checkbox from "../components/CheckBox";
import { IoMdLogIn } from "react-icons/io";
import { RiLoginCircleFill } from "react-icons/ri";

/**
 * @description 
 *  - This component is a login page UI for the Perplexity application.
 * @returns {
 *      loginPage UI
 *  }
*/

// --- Icons (inline SVG, no external deps) ---
const FingerprintIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <path d="M12 11a3 3 0 0 1 3 3v1a6 6 0 0 1-1.5 4" strokeLinecap="round" />
            <path d="M9 17a5 5 0 0 0 1-3v-1a2 2 0 1 1 4 0" strokeLinecap="round" />
            <path d="M6.5 19a9 9 0 0 1-1.5-5v-2a7 7 0 0 1 14 0" strokeLinecap="round" />
            <path d="M4 15.5V12a8 8 0 0 1 16 0v1" strokeLinecap="round" />
      </svg>
);

const KeyIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" {...props}>
            <circle cx="8" cy="8" r="3.5" />
            <path d="M10.3 10.3 20 20M16 14l2 2M18 12l2 2" strokeLinecap="round" />
      </svg>
);

const EyeIcon = (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 cursor-pointer" {...props}>
            <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" />
      </svg>
);

export default function LoginPage() {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [showKey, setShowKey] = useState(false);
      const [persistNode, setPersistNode] = useState(false);

      const cleanUp = () => {
            setEmail("");
            setPassword("");
            setShowKey(false);
            setPersistNode(false);
      }

      const handleSubmit = (e) => {
            e.preventDefault();
            // Wire this up to your auth flow
            console.log({ email, password, persistNode });
            cleanUp();
      };

      return (
            <div className="min-h-screen w-full bg-[#0c0c0c] relative overflow-hidden flex flex-col">
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

                  {/* top status pill */}
                  <div className="relative z-10 flex justify-end p-6">
                        <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-1.5">
                              <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                              <span className="text-xs font-mono tracking-widest text-slate-300">
                                    GLOBAL CORE ONLINE
                              </span>
                        </div>
                  </div>

                  {/* main card */}
                  <div className="relative z-10 flex-1 flex items-center justify-center px-4">
                        <div className="relative w-full max-w-md rounded-xl bg-[#121414] backdrop-blur-xl p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden">

                              {/* logo */}
                              <div className="relative flex justify-center mb-6">
                                    <IoMdLogIn className="w-15 h-15 text-[#aec0ff]" />
                              </div>

                              {/* heading */}
                              <h1 className="relative text-center text-3xl font-bold text-slate-100">
                                    Perplexor
                              </h1>
                              <p className="relative mt-2 text-center text-xs font-mono tracking-[0.2em] text-slate-400">
                                    PROTOCOL VERIFICATION REQUIRED
                              </p>

                              {/* form */}
                              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                                    <Input
                                          label="Email"
                                          icon={<FingerprintIcon />}
                                          placeholder="Enter your email..."
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                    />

                                    <Input
                                          label="Password"
                                          icon={<KeyIcon />}
                                          type={showKey ? "text" : "password"}
                                          placeholder="Enter your password..."
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          trailingIcon={<EyeIcon />}
                                          onTrailingIconClick={() => setShowKey((v) => !v)}
                                          inputClassName="tracking-widest"
                                    />

                                    <div className="flex items-center justify-between -mt-1">
                                          <Checkbox
                                                label="Persist Node"
                                                checked={persistNode}
                                                onChange={(e) => setPersistNode(e.target.checked)}
                                          />
                                          <Button variant="link" type="button" className="text-sm">
                                                Emergency Recovery
                                          </Button>
                                    </div>

                                    <Button type="submit" variant="primary" icon={<RiLoginCircleFill />} className="mt-2">
                                          Login
                                    </Button>
                              </form>

                              {/* divider */}
                              <div className="my-6 border-t border-slate-800" />

                              {/* footer link */}
                              <p className="text-center text-sm text-slate-300">
                                    New User?{" "}
                                    <Button variant="link" type="button">
                                          Sign Up
                                    </Button>
                              </p>
                        </div>
                  </div>

                  {/* bottom bar */}
                  <div className="relative z-10 flex items-center justify-between px-8 py-5 text-xs font-mono text-slate-500">
                        <span>© 2024 NeonAI Systems</span>
                        <span className="hidden sm:inline">Status: Operational &nbsp; V: 4.0.2-Alpha</span>
                        <div className="flex gap-6">
                              <span className="hover:text-slate-300 transition-colors cursor-pointer">PRIVACY PROTOCOL</span>
                              <span className="hover:text-slate-300 transition-colors cursor-pointer">NEURAL TERMS</span>
                        </div>
                  </div>
            </div>
      );
}
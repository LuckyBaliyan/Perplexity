import React from "react";

/**
 * Checkbox
 * A dynamically-classed labeled checkbox.
 *
 * Props:
 * - label: string — text rendered next to the box
 * - checked, onChange — standard controlled checkbox props
 * - className: string — extra classes appended to the wrapper
 */
export default function Checkbox({ label, checked, onChange, className = "", ...rest }) {
      return (
            <label
                  className={`flex items-center gap-2 cursor-pointer select-none text-sm text-slate-300 ${className}`}
            >
                  <input
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        className="peer sr-only"
                        {...rest}
                  />
                  <span
                        className="h-4 w-4 rounded-[4px] border border-slate-600 bg-slate-900/60
                   flex items-center justify-center
                   peer-checked:bg-indigo-300 peer-checked:border-indigo-300
                   transition-colors"
                  >
                        {checked && (
                              <svg viewBox="0 0 24 24" className="h-3 w-3 text-indigo-950" fill="none">
                                    <path
                                          d="M5 13l4 4L19 7"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                    />
                              </svg>
                        )}
                  </span>
                  {label}
            </label>
      );
}
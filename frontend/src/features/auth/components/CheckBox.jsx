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
/**
 * @description Checkbox — Interactive custom checkbox component styled with design system tokens.
 * @param {Object} props - Checkbox props including label, checked state, onChange handler, and HTML input props.
 * @returns {React.ReactElement} Formatted labeled checkbox element.
 */
export default function Checkbox({ label, checked, onChange, className = "", ...rest }) {
      return (
            <label
                  className={`flex items-center gap-2 cursor-pointer select-none text-sm text-[var(--text-secondary)] ${className}`}
            >
                  <input
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        className="peer sr-only"
                        {...rest}
                  />
                  <span
                        className="h-4 w-4 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-card)]
                   flex items-center justify-center
                   peer-checked:bg-[var(--accent-primary)] peer-checked:border-[var(--accent-primary)]
                   transition-colors"
                  >
                        {checked && (
                              <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--text-inverse)]" fill="none">
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
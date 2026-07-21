import React from "react";

/**
 * Input
 * A dynamically-classed labeled input field with a leading icon and
 * optional trailing action (e.g. password visibility toggle).
 *
 * Props:
 * - label: string — field label rendered above the input
 * - icon: ReactNode — leading icon (e.g. from lucide-react)
 * - trailingIcon: ReactNode — optional trailing icon/button (e.g. eye toggle)
 * - onTrailingIconClick: fn — click handler for trailing icon
 * - className: string — extra classes appended to the input wrapper
 * - inputClassName: string — extra classes appended to the <input> itself
 * - ...rest — passed directly to the underlying <input> (type, value, onChange, placeholder, etc.)
 */
export default function Input({
      label,
      icon,
      trailingIcon,
      onTrailingIconClick,
      className = "",
      inputClassName = "",
      ...rest
}) {
      return (
            <div className={`flex flex-col gap-2 ${className}`}>
                  {label && (
                        <label className="text-xs font-mono tracking-wide text-slate-300">
                              {label}
                        </label>
                  )}
                  <div
                        className="flex items-center gap-3 rounded-sm border border-slate-700/60
                   bg-[#121414] px-4 py-3.5 transition-colors
                   focus-within:border-gray-400/70 focus-within:bg-[#121414]"
                  >
                        {icon && (
                              <span className="shrink-0 text-slate-500">{icon}</span>
                        )}
                        <input
                              className={`w-full h-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500
                      placeholder:font-mono focus:outline-none ${inputClassName}`}
                              {...rest}
                        />
                        {trailingIcon && (
                              <button
                                    type="button"
                                    onClick={onTrailingIconClick}
                                    className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                              >
                                    {trailingIcon}
                              </button>
                        )}
                  </div>
            </div>
      );
}
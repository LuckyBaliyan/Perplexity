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
/**
 * @description Input — Form input field component with support for labels, leading/trailing icons, and design system styling.
 * @param {Object} props - Input properties including label, icon, trailingIcon, click handlers, and input HTML props.
 * @returns {React.ReactElement} Formatted labeled input element.
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
                        <label className="text-xs font-mono tracking-wide text-[var(--text-secondary)]">
                              {label}
                        </label>
                  )}
                  <div
                        className="flex items-center gap-3 rounded-sm border border-[var(--border-default)]
                   bg-[var(--bg-surface)] px-4 py-3.5 transition-colors
                   focus-within:border-[var(--accent-primary)] focus-within:bg-[var(--bg-surface)]"
                  >
                        {icon && (
                              <span className="shrink-0 text-[var(--text-muted)]">{icon}</span>
                        )}
                        <input required
                              className={`w-full h-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                      placeholder:font-mono focus:outline-none ${inputClassName}`}
                              {...rest}
                        />
                        {trailingIcon && (
                              <button
                                    type="button"
                                    onClick={onTrailingIconClick}
                                    className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    tabIndex={-1}
                              >
                                    {trailingIcon}
                              </button>
                        )}
                  </div>
            </div>
      );
}
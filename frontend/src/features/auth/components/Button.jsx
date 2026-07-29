import React from "react";

/**
 * Button
 * A dynamically-classed button supporting multiple visual variants.
 *
 * Props:
 * - variant: "primary" | "ghost" | "link" — controls the visual style
 * - icon: ReactNode — optional trailing icon (e.g. rocket emoji/svg)
 * - className: string — extra classes merged onto the computed variant classes
 * - children: button label content
 * - ...rest — passed directly to the underlying <button> (onClick, type, disabled, etc.)
 */
const VARIANT_CLASSES = {
      primary:
            "w-full rounded-sm bg-[var(--accent-primary)] text-[var(--text-inverse)] " +
            "font-semibold text-lg py-3 hover:brightness-110 " +
            "transition-all active:scale-[0.99]",
      ghost:
            "rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] " +
            "font-medium px-4 py-2 hover:bg-[var(--bg-surface-hover)] transition-colors",
      link:
            "text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] font-medium underline-offset-2 hover:underline transition-colors",
};

/**
 * @description Button — A customizable UI button component that renders styled actions using design system tokens.
 * @param {Object} props - Button props including variant, icon, className, children, and HTML button attributes.
 * @returns {React.ReactElement} Formatted button element.
 */
export default function Button({
      variant = "primary",
      icon,
      className = "",
      children,
      ...rest
}) {

      const base = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

      return (
            <button
                  className={`inline-flex items-center cursor-pointer justify-center gap-2 ${base} ${className}`}
                  {...rest}
            >
                  {children}
                  {icon && <span className="text-xl leading-none">{icon}</span>}
            </button>
      );
}
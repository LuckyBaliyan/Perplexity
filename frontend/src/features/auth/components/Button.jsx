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
            "w-full rounded-sm bg-[#aec0ff]  text-indigo-950 " +
            "font-semibold text-lg py-3 " +
            "transition-all active:scale-[0.99]",
      ghost:
            "rounded-lg border border-slate-700/60 bg-slate-900/60 text-slate-200 " +
            "font-medium px-4 py-2 hover:bg-slate-800/60 transition-colors",
      link:
            "text-lime-400 hover:text-lime-300 font-medium underline-offset-2 hover:underline transition-colors",
};

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
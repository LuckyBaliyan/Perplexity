/**
 * @description Loader — Renders a full-screen spinning loader component during auth transitions and async state resolution.
 * @returns {React.ReactElement} Formatted loading screen element.
 */
const Loader = () => {
      return (
            <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)] font-[Geist,sans-serif] flex flex-col">
                  <main className="flex-1 flex flex-col items-center justify-center px-6">
                        <div className="relative w-20 h-20">
                              <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
                              <div
                                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-primary)] animate-spin"
                                    style={{ filter: "drop-shadow(0 0 12px rgba(173,198,255,0.6))" }}
                              />
                        </div>
                  </main>
            </div>
      );
}

export default Loader;

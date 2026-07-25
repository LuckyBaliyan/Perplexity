/**
 * Shown in place of the error content once login / register has actually
 * succeeded and a user is sitting in the store — this page holds briefly
 * while the redirect to the app fires, instead of ever flashing an error.
 */
const Loader = () => {
      return (
            <div className="min-h-screen bg-[#121414] text-[#e2e2e2] font-[Geist,sans-serif] flex flex-col">
                  <main className="flex-1 flex flex-col items-center justify-center px-6">
                        <div className="relative w-20 h-20">
                              <div className="absolute inset-0 rounded-full border-2 border-[#333535]" />
                              <div
                                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#adc6ff] animate-spin"
                                    style={{ filter: "drop-shadow(0 0 12px rgba(173,198,255,0.6))" }}
                              />
                        </div>
                  </main>
            </div>
      );
}

export default Loader;

import React from "react"
import { useAuth } from "../auth/hooks/useAuth"

export default function Home({ onStartNegotiation }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">

      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-6 md:px-16 py-4 sticky top-0 z-30 backdrop-blur border-b border-black/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent rounded-full border-2 border-black flex items-center justify-center text-lg font-bold text-black shadow">
            {user?.name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-black leading-tight">
              {user?.name || user?.email}
            </span>
            <span className="text-xs text-gray-600 leading-tight">
              {user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-1.5 rounded-lg bg-btn-main border border-black text-white font-semibold text-sm shadow hover:bg-[#372b7c] hover:scale-105 transition"
        >
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 text-center py-10">

        {/* TITLE */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 tracking-tight drop-shadow-sm">
          Bargenix
        </h1>

        <p className="text-base md:text-lg text-gray-800 max-w-2xl mb-8">
          Outsmart the AI seller and climb the leaderboard by getting the best deal.
        </p>

        {/* SECTION LABEL */}
        <div className="mb-4 text-xs text-gray-700 uppercase tracking-widest">
          Game Mechanics
        </div>

        {/* 🔥 NEW FEATURES SECTION */}
        <div className="w-full max-w-5xl mb-12">
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">

            {/* Feature 1 */}
            <div className="flex-1 p-5 rounded-xl border border-black/20 backdrop-blur-md bg-white/30 shadow-md hover:shadow-xl transition hover:-translate-y-1">
              <div className="text-left">
                <h3 className="text-lg font-bold text-black mb-1">
                  Multi-Round Game
                </h3>
                <p className="text-sm text-gray-700">
                  Limited rounds. Every move impacts your final deal.
                </p>
              </div>
              <div className="mt-4 h-1 w-12 bg-accent rounded"></div>
            </div>

            {/* Feature 2 */}
            <div className="flex-1 p-5 rounded-xl border border-black/20 backdrop-blur-md bg-white/30 shadow-md hover:shadow-xl transition hover:-translate-y-1">
              <div className="text-left">
                <h3 className="text-lg font-bold text-black mb-1">
                  AI Seller
                </h3>
                <p className="text-sm text-gray-700">
                  Negotiates smartly, adapts to your strategy and tone.
                </p>
              </div>
              <div className="mt-4 h-1 w-12 bg-accent rounded"></div>
            </div>

            {/* Feature 3 */}
            <div className="flex-1 p-5 rounded-xl border border-black/20 backdrop-blur-md bg-white/30 shadow-md hover:shadow-xl transition hover:-translate-y-1">
              <div className="text-left">
                <h3 className="text-lg font-bold text-black mb-1">
                  Leaderboard
                </h3>
                <p className="text-sm text-gray-700">
                  Compete globally. Lower deal gets you higher rank.
                </p>
              </div>
              <div className="mt-4 h-1 w-12 bg-accent rounded"></div>
            </div>

          </div>
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={onStartNegotiation}
          className="w-full max-w-xs py-5 rounded-2xl bg-btn-main border-2 border-black text-white font-extrabold text-xl relative overflow-hidden hover:scale-105 transition shadow-xl"
        >
          <span className="absolute inset-0 flex items-center justify-center z-10">
            Start Negotiation
          </span>

          <span className="absolute inset-0 rounded-2xl border-black border-2 pointer-events-none z-20"></span>

          <span className="absolute inset-0 rounded-2xl bg-[repeating-linear-gradient(-45deg,_var(--stripe)_0px,_var(--stripe)_8px,_var(--btn-main)_8px,_var(--btn-main)_16px)] opacity-30 pointer-events-none z-0"></span>
        </button>

      </main>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-700 py-6 opacity-80">
        Built with strategy • Powered by AI
      </footer>

      {/* THEME */}
      <style>{`
        :root {
          --bg-main: #d6c7fa;
          --bg-card: #f6f3ff;
          --accent: #ffd600;
          --btn-main: #4b3cc4;
          --stripe: #a18aff;
        }
        .bg-bg-main { background-color: var(--bg-main); }
        .bg-bg-card { background-color: var(--bg-card); }
        .bg-accent { background-color: var(--accent); }
        .bg-btn-main { background-color: var(--btn-main); }
      `}</style>
    </div>
  )
}
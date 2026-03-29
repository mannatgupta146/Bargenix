import React from "react"
import { useAuth } from "../auth/hooks/useAuth"

export default function Home({ onStartNegotiation }) {
  const { user, logout } = useAuth()
  // Fallback handler if not provided
  const handleStart = onStartNegotiation || (() => alert("Negotiation feature coming soon!"))

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
        <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
          Bargenix
        </h1>

        {/* 🔥 NEW HERO LINES */}
        <div className="max-w-2xl mb-6 space-y-2">
          <p className="text-lg md:text-xl text-black font-medium">
            Negotiation isn’t luck. It’s strategy.
          </p>
          <p className="text-sm md:text-base text-gray-800">
            Chat with an AI seller, make your best offer, and see how low you
            can go.
          </p>
          <p className="text-sm text-gray-700">
            The better you negotiate, the higher you’ll rank.
          </p>
        </div>

        {/* 🔥 CTA MOVED UP */}
        <button
          onClick={handleStart}
          className="w-full max-w-xs py-5 mb-10 rounded-2xl bg-btn-main border-2 border-black text-white font-extrabold text-xl relative overflow-hidden hover:scale-105 transition shadow-xl"
        >
          <span className="absolute inset-0 flex items-center justify-center z-10">
            Start Negotiation
          </span>

          <span className="absolute inset-0 rounded-2xl border-black border-2 pointer-events-none z-20"></span>

          <span className="absolute inset-0 rounded-2xl bg-[repeating-linear-gradient(-45deg,_var(--stripe)_0px,_var(--stripe)_8px,_var(--btn-main)_8px,_var(--btn-main)_16px)] opacity-30 pointer-events-none z-0"></span>
        </button>

        {/* SECTION LABEL */}
        <div className="mb-4 text-xs text-gray-700 uppercase tracking-widest">
          How It Works
        </div>

        {/* FEATURES */}
        <div className="w-full max-w-5xl">
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">
            <div className="flex-1 p-5 rounded-xl border border-black/20 backdrop-blur-md bg-white/30 shadow-md hover:shadow-xl transition hover:-translate-y-1">
              <h3 className="text-lg font-bold text-black mb-1 text-left">
                Multi-Round Game
              </h3>
              <p className="text-sm text-gray-700 text-left">
                Limited rounds. Every move impacts your final deal.
              </p>
              <div className="mt-4 h-1 w-12 bg-accent rounded"></div>
            </div>

            <div className="flex-1 p-5 rounded-xl border border-black/20 backdrop-blur-md bg-white/30 shadow-md hover:shadow-xl transition hover:-translate-y-1">
              <h3 className="text-lg font-bold text-black mb-1 text-left">
                AI Seller
              </h3>
              <p className="text-sm text-gray-700 text-left">
                Negotiates smartly, adapts to your strategy and tone.
              </p>
              <div className="mt-4 h-1 w-12 bg-accent rounded"></div>
            </div>

            <div className="flex-1 p-5 rounded-xl border border-black/20 backdrop-blur-md bg-white/30 shadow-md hover:shadow-xl transition hover:-translate-y-1">
              <h3 className="text-lg font-bold text-black mb-1 text-left">
                Leaderboard
              </h3>
              <p className="text-sm text-gray-700 text-left">
                Compete globally. Lower deal gets you higher rank.
              </p>
              <div className="mt-4 h-1 w-12 bg-accent rounded"></div>
            </div>
          </div>
        </div>
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

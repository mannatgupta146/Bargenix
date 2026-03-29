import React from "react"
import { useAuth } from "../auth/hooks/useAuth"

export default function Home({ onStartNegotiation }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center px-4">
      <header className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent rounded-full border-2 border-black flex items-center justify-center text-2xl font-bold text-black">
            {user?.name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "U"}
          </div>
          <div>
            <div className="text-xl font-bold text-black">
              {user?.name || user?.email}
            </div>
            <div className="text-sm text-gray-700">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-6 py-2 rounded-xl bg-btn-main border-2 border-black text-white font-bold text-base relative overflow-hidden hover:scale-105 transition-transform duration-200"
        >
          Logout
        </button>
      </header>
      <main className="w-full max-w-2xl bg-bg-card rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center text-black mb-4">
          Welcome to Bargenix!
        </h1>
        <p className="text-center text-black mb-8">
          Start negotiating with the AI seller and try to get the lowest price
          possible. Your best deals will appear on the leaderboard!
        </p>
        <button
          onClick={onStartNegotiation}
          className="w-full max-w-xs py-4 rounded-xl bg-btn-main border-2 border-black text-white font-bold text-lg relative overflow-hidden flex items-center justify-center hover:scale-105 transition-transform duration-200"
        >
          <span className="absolute inset-0 flex items-center justify-center z-10">
            Start Negotiation
          </span>
          <span className="absolute inset-0 rounded-xl border-black border-2 pointer-events-none z-20"></span>
          <span className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(-45deg,_var(--stripe)_0px,_var(--stripe)_8px,_var(--btn-main)_8px,_var(--btn-main)_16px)] opacity-30 pointer-events-none z-0"></span>
        </button>
      </main>
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

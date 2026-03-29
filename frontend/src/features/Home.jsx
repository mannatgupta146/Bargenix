import React from "react"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="w-full max-w-xs bg-bg-card rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center relative">
        <div className="w-14 h-14 bg-accent rounded-full border-2 border-black absolute -top-7 left-1/2 -translate-x-1/2"></div>
        <div className="w-full flex flex-col gap-6 mt-10">
          <div className="border-t border-black" />
          <div className="border-t border-black" />
          <h1 className="text-2xl font-bold text-center text-black mb-2">
            Welcome to Bargenix!
          </h1>
          <p className="text-center text-black mb-4">
            Start negotiating with the AI seller and try to get the lowest price
            possible. Your best deals will appear on the leaderboard!
          </p>
          <button className="w-full py-2 rounded-xl bg-btn-main border-2 border-black text-white font-bold text-lg relative overflow-hidden flex items-center justify-center hover:scale-105 transition-transform duration-200">
            Start Negotiation
            <span
              className="absolute inset-0 rounded-xl border-black border-2 pointer-events-none"
              style={{ zIndex: 1 }}
            ></span>
            <span
              className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(-45deg,_var(--stripe)_0px,_var(--stripe)_8px,_var(--btn-main)_8px,_var(--btn-main)_16px)] opacity-30 pointer-events-none"
              style={{ zIndex: 0 }}
            ></span>
          </button>
        </div>
      </div>
      <style>{`
        :root {
          --bg-main: #d6c7fa;
          --bg-card: #d6c7fa;
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

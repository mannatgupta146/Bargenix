import React, { useState, useEffect, useRef } from "react"
import { useNegotiate } from "./hooks/useNegotiate"
import { useNavigate } from "react-router-dom"

export default function Negotiate() {
  const [offer, setOffer] = useState("")
  const [message, setMessage] = useState("")
  const audioRef = useRef(null)
  const navigate = useNavigate()
  const {
    session,
    history,
    loading,
    error,
    completed,
    finalPrice,
    startNegotiation,
    makeOffer,
    reset,
  } = useNegotiate()

  // Start negotiation session automatically on mount if not started
  useEffect(() => {
    if (!session && !loading) {
      reset()
      startNegotiation()
      setOffer("")
    }
    // eslint-disable-next-line
  }, [])

  const submitOffer = (e) => {
    e.preventDefault()
    if (!offer || isNaN(Number(offer))) return
    makeOffer(Number(offer), message)
    setOffer("")
    setMessage("")
  }

  // Play sound after every AI reply
  useEffect(() => {
    if (history.length > 0 && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }, [history.length])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main px-4 py-10">
      {/* Fixed Back Button */}
      <button
        className="flex items-center gap-1 px-4 py-2 bg-btn-main text-white font-semibold rounded-2xl border border-black hover:bg-[#372b7c] transition text-base shadow"
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 50,
          width: 100,
          minWidth: 100,
          maxWidth: 100,
          justifyContent: "center",
        }}
        onClick={() => navigate(-1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span style={{ display: "inline-block", width: 40, textAlign: "left" }}>Back</span>
      </button>
      <div className="w-full max-w-md bg-bg-card rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center relative">
        <h1 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
          Negotiate
        </h1>
        {/* Chat-like instruction box */}
        <div className="w-full mb-6">
          <div className="bg-white border border-black/20 rounded-xl p-4 text-sm text-gray-900 shadow-sm" style={{ lineHeight: 1.6 }}>
            <b>Build a negotiation game</b> where you interact with an AI seller to purchase a fixed product at the lowest possible price. The AI has its own hidden constraints like minimum price, target profit, and negotiation strategy, while your goal is to convince it to reduce the price through reasoning, timing, and tactics. Each interaction runs as a multi-round negotiation, and your final deal price determines your position on a global leaderboard—the lower the price, the higher you rank. <b>This is not just a chat experience</b>; your success depends on how well you understand and influence the AI’s behavior across rounds.
          </div>
        </div>
        {!session || loading ? (
          <div className="w-full flex items-center justify-center min-h-[120px]">
            <span className="text-lg text-gray-700 font-semibold">
              {loading ? "Starting negotiation..." : "Preparing..."}
            </span>
          </div>
        ) : completed ? (
          <div className="text-center">
            <div className="text-lg font-bold text-green-700 mb-2">
              Negotiation Complete!
            </div>
            <div className="mb-2">
              Final Price: <span className="font-bold">${finalPrice}</span>
            </div>
            <button
              onClick={() => {
                reset()
                startNegotiation()
                setOffer("")
              }}
              className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mt-2"
            >
              Start New Negotiation
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submitOffer} className="flex flex-col gap-2 mb-4 w-full">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="flex-1 px-3 py-2 border border-black rounded"
                  placeholder="Your offer"
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold"
                  disabled={loading}
                >
                  Offer
                </button>
              </div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-3 py-2 border border-black rounded"
                placeholder="Optional message to AI"
                disabled={loading}
              />
            </form>
            <div className="w-full mb-2">
              <div className="font-bold mb-1">Negotiation Chat</div>
              <div className="bg-white rounded p-2 border border-black/10 text-sm max-h-56 overflow-y-auto flex flex-col gap-2">
                {history.length === 0 && (
                  <div className="text-gray-500">No offers yet.</div>
                )}
                {history.map((h, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-end mb-1">
                      <div className="bg-btn-main text-white px-3 py-2 rounded-xl max-w-[80%] text-right">
                        <b>You:</b> ${h.userOffer}
                        {h.userMessage && <div className="text-xs mt-1">{h.userMessage}</div>}
                      </div>
                    </div>
                    <div className="flex flex-col items-start mb-2">
                      <div className="bg-gray-200 text-black px-3 py-2 rounded-xl max-w-[80%]">
                        <b>AI:</b> ${h.aiCounter}
                        {h.aiMessage && <div className="text-xs mt-1">{h.aiMessage}</div>}
                        {i > 0 &&
                          <div className="text-xs text-green-700 mt-1 font-semibold">
                            Price lessened by ${
                              Math.max(0, history[i - 1].aiCounter - h.aiCounter)
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {/* Play FAHH sound after every AI reply */}
              <audio ref={audioRef} src="/FAHH.mp4" preload="auto" />
            </div>
          </>
        )}
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {/* THEME for Negotiate page */}
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
    </div>
  )
}

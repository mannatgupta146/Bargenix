import React, { useState } from "react"
import { useNegotiate } from "./hooks/useNegotiate"

export default function Negotiate() {
  const [offer, setOffer] = useState("")
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

  const handleStart = () => {
    reset()
    startNegotiation()
    setOffer("")
  }

  const submitOffer = (e) => {
    e.preventDefault()
    if (!offer || isNaN(Number(offer))) return
    makeOffer(Number(offer))
    setOffer("")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main px-4 py-10">
      <div className="w-full max-w-md bg-bg-card rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center">
        <h1 className="text-2xl font-bold text-black mb-4">Negotiation Game</h1>
        {!session ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-xl bg-btn-main border-2 border-black text-white font-bold text-lg hover:scale-105 transition mb-2"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Negotiation"}
          </button>
        ) : completed ? (
          <div className="text-center">
            <div className="text-lg font-bold text-green-700 mb-2">
              Negotiation Complete!
            </div>
            <div className="mb-2">
              Final Price: <span className="font-bold">${finalPrice}</span>
            </div>
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mt-2"
            >
              Start New Negotiation
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submitOffer} className="flex gap-2 mb-4 w-full">
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
            </form>
            <div className="w-full mb-2">
              <div className="font-bold mb-1">History</div>
              <div className="bg-white rounded p-2 border border-black/10 text-sm max-h-40 overflow-y-auto">
                {history.length === 0 && (
                  <div className="text-gray-500">No offers yet.</div>
                )}
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      You: <span className="font-semibold">{h.user}</span>
                    </span>
                    <span>
                      AI: <span className="font-semibold">{h.ai}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </div>
    </div>
  )
}

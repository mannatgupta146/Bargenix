import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Negotiate() {
  const [offer, setOffer] = useState("")
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState([])
  const [round, setRound] = useState(0)
  const [aiPrice, setAiPrice] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [finalPrice, setFinalPrice] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const productId = params.get("product")
    if (!productId) {
      setLoading(false)
      return
    }
    fetch(`https://fakestoreapi.com/products/${productId.replace(/-x.*/, "")}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data)
        setAiPrice(Number(data.price))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [location.search])

  const submitOffer = (e) => {
    e.preventDefault()
    if (!offer || isNaN(Number(offer)) || completed) return
    const userOffer = Number(offer)
    let newAiPrice = aiPrice
    let aiMsg = ""
    let playFahh = true
    if (round < 5) {
      newAiPrice = Math.max(
        Number(product.price) * (1 - 0.05 * (round + 1)),
        userOffer,
      )
      aiMsg =
        newAiPrice <= userOffer
          ? `Deal! You got it for $${userOffer}`
          : `I can do $${newAiPrice.toFixed(2)}. Can you go higher?`
    } else {
      newAiPrice = Number(product.price) * 0.75
      aiMsg = "I can't go below this."
      playFahh = false
    }
    setHistory((h) => [
      ...h,
      {
        userOffer,
        userMessage: message,
        aiCounter: newAiPrice,
        aiMessage: aiMsg,
        round: round + 1,
      },
    ])
    setAiPrice(newAiPrice)
    setRound((r) => r + 1)
    setOffer("")
    setMessage("")
    if (round >= 4 || newAiPrice <= userOffer) {
      setCompleted(true)
      setFinalPrice(Math.min(newAiPrice, userOffer))
    }
    setTimeout(() => {
      if (playFahh && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      } else if (!playFahh && videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    }, 200)
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 py-10">
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <span style={{ display: "inline-block", width: 40, textAlign: "left" }}>
          Back
        </span>
      </button>
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 bg-bg-card rounded-2xl shadow-xl p-8 border border-black items-stretch relative">
        <div className="flex-1 flex flex-col items-center md:items-start justify-center gap-4 border-r border-black/20 pr-8">
          <img
            src={product.image}
            alt={product.title}
            className="w-40 h-40 object-contain rounded bg-white border border-black mb-2"
          />
          <h2 className="text-2xl font-extrabold text-black mb-1">
            {product.title}
          </h2>
          <div className="text-xl font-bold text-btn-main mb-2">
            ${product.price}
          </div>
          <div className="text-sm text-gray-700 mb-2 opacity-90 max-w-xs">
            {product.description}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
            Negotiate
          </h1>
          <form
            onSubmit={submitOffer}
            className="flex flex-col gap-2 mb-4 w-full max-w-sm"
          >
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="flex-1 px-3 py-2 border border-black rounded"
                placeholder="Your offer"
                disabled={completed}
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold"
                disabled={completed}
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
              disabled={completed}
            />
          </form>
          <div className="w-full mb-2 max-w-sm">
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
                      {h.userMessage && (
                        <div className="text-xs mt-1">{h.userMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start mb-2">
                    <div className="bg-gray-200 text-black px-3 py-2 rounded-xl max-w-[80%]">
                      <b>AI:</b> ${h.aiCounter.toFixed(2)}
                      {h.aiMessage && (
                        <div className="text-xs mt-1">{h.aiMessage}</div>
                      )}
                      {i > 0 && (
                        <div className="text-xs text-green-700 mt-1 font-semibold">
                          Price lessened by $
                          {Math.max(
                            0,
                            history[i - 1].aiCounter - h.aiCounter,
                          ).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <audio ref={audioRef} src="/FAHH.mp3" preload="auto" />
            <video
              ref={videoRef}
              src="/gareeb.mp4"
              style={{ display: "none" }}
            />
          </div>
          {completed && (
            <div className="text-center mt-4">
              <div className="text-lg font-bold text-green-700 mb-2">
                Negotiation Complete!
              </div>
              <div className="mb-2">
                Final Price:{" "}
                <span className="font-bold">${finalPrice?.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setHistory([])
                  setRound(0)
                  setAiPrice(Number(product.price))
                  setCompleted(false)
                  setFinalPrice(null)
                }}
                className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mt-2"
              >
                Start New Negotiation
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
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

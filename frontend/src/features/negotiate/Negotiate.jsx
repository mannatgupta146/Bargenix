import { useNegotiate } from "./hooks/useNegotiate"
import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Negotiate() {
  const {
    startNegotiation,
    makeOffer,
    reset,
    acceptFinal,
    history: reduxHistory,
    completed: reduxCompleted,
    finalPrice: reduxFinalPrice,
    finalAccepted: reduxFinalAccepted,
    setFinalAccepted: reduxSetFinalAccepted,
    loading: reduxLoading,
    error: reduxError,
  } = useNegotiate()

  const [offer, setOffer] = useState("")
  const [message, setMessage] = useState("")
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showVideo, setShowVideo] = useState(false)
  const [showFinalChoice, setShowFinalChoice] = useState(false)
  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const chatEndRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [reduxHistory])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    let productId = params.get("product")
    if (!productId) {
      try {
        const lastSelected = JSON.parse(
          localStorage.getItem("bargenix_selected_product"),
        )
        if (lastSelected && lastSelected.id) {
          navigate(`/negotiate?product=${lastSelected.id}`, { replace: true })
          return
        }
      } catch (e) {}
      setError(
        "No product selected. Please go to the product list and choose a product.",
      )
      setLoading(false)
      return
    }

    let prod = null
    try {
      const allProducts = JSON.parse(
        localStorage.getItem("bargenix_all_products"),
      )
      if (Array.isArray(allProducts)) {
        prod = allProducts.find(
          (p) => p.id === productId || String(p.id) === String(productId),
        )
        if (prod) {
          setProduct(prod)
          setLoading(false)
          reset()
          setTimeout(() => startNegotiation(prod.id, Number(prod.price), prod.title, prod.image), 50)
          return
        }
      }
    } catch (e) {}

    fetch(`https://fakestoreapi.com/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found")
        return res.json()
      })
      .then((data) => {
        setProduct(data)
        setLoading(false)
        try {
          let allProducts =
            JSON.parse(localStorage.getItem("bargenix_all_products")) || []
          if (
            !allProducts.find(
              (p) => p.id === data.id || String(p.id) === String(data.id),
            )
          ) {
            allProducts.push(data)
            localStorage.setItem(
              "bargenix_all_products",
              JSON.stringify(allProducts),
            )
          }
        } catch (e) {}
        reset()
        setTimeout(() => startNegotiation(data.id, Number(data.price), data.title, data.image), 50)
      })
      .catch(() => {
        setError(
          "Product not found. Please select again from the product list.",
        )
        setLoading(false)
      })
  }, [location.search, navigate])

  const submitOffer = async (e) => {
    e.preventDefault()
    if (!offer || isNaN(Number(offer)) || reduxCompleted) return
    const userOffer = Number(offer)
    await makeOffer(userOffer, message)
    setOffer("")
    setMessage("")
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    }, 200)
  }

  useEffect(() => {
    console.log("[Negotiate] Checking for final choice:", { reduxCompleted, reduxFinalPrice, reduxLoading, roundsCount: reduxHistory.length })
    if (reduxCompleted && reduxFinalPrice && !reduxLoading) {
      const dealReached = reduxHistory.some((h) =>
        h.aiMessage?.includes("Deal!"),
      )
      console.log("[Negotiate] Deal reached state:", dealReached)
      if (!dealReached && reduxFinalAccepted === null) {
        console.log("[Negotiate] SHOWING FINAL CHOICE MODAL")
        setShowFinalChoice(true)
      }
    }
  }, [reduxCompleted, reduxFinalPrice, reduxLoading, reduxHistory, reduxFinalAccepted])

  const isPending = loading || reduxLoading
  const currentError = error || reduxError

  if (isPending && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg text-black">
        Loading...
      </div>
    )
  }
  if (currentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg text-red-600">
        {currentError}
      </div>
    )
  }
  if (!product) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 py-10 relative">
      <button
        className="flex items-center gap-1 px-4 py-2 bg-btn-main text-white font-semibold rounded-2xl border border-black hover:bg-[#372b7c] transition text-base shadow"
        style={{ position: "fixed", top: 24, left: 24, zIndex: 50 }}
        onClick={() => navigate(-1)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span>Back</span>
      </button>

      <div className="w-full max-w-5xl h-[85vh] max-h-[750px] flex flex-col md:flex-row gap-8 bg-bg-card rounded-2xl shadow-xl p-8 border border-black items-stretch relative overflow-hidden">
        <div className="flex-1 flex flex-col items-center md:items-start md:pr-8 border-b md:border-b-0 md:border-r border-black/10 overflow-hidden pb-6 md:pb-0">
          <div className="w-full h-48 flex items-center justify-center bg-white rounded-2xl border border-black/5 mb-6 p-4 shadow-inner">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="w-full overflow-y-auto pr-2 custom-scrollbar flex-1">
            <h2 className="text-2xl font-black text-black leading-tight mb-2 tracking-tight">
              {product.title}
            </h2>
            
            <div className="inline-block px-4 py-1 bg-btn-main/10 text-btn-main rounded-full font-bold text-xl mb-4 border border-btn-main/20">
              ${product.price}
            </div>

            <div className="text-sm text-gray-600 leading-relaxed opacity-80">
              {product.description}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[60vh] pb-2">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
              {reduxHistory.length === 0 && !isPending && (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-center px-4">
                  Make an offer to start the negotiation! You have 5 attempts.
                </div>
              )}
              {reduxHistory.map((r, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex justify-end pr-2">
                    <div className="relative group max-w-[80%]">
                      <div className="bg-btn-main text-white px-4 py-2 rounded-2xl rounded-tr-none border border-black shadow-sm">
                        <div className="text-xs font-bold opacity-75 mb-1">Attempt {i + 1}/5</div>
                        <div className="font-bold">You: ${r.userOffer}</div>
                        {r.userMessage && <div className="text-sm mt-1">{r.userMessage}</div>}
                      </div>
                    </div>
                  </div>
                  {r.aiCounter && (
                    <div className="flex justify-start pl-2">
                      <div className="relative max-w-[80%]">
                        <div className="bg-gray-100 text-black px-4 py-2 rounded-2xl rounded-tl-none border border-black/20 shadow-sm">
                          <div className="text-xs font-bold text-btn-main/70 mb-1">AI Counter {i + 1}/5</div>
                          <div className="font-bold text-btn-main">AI: ${r.aiCounter?.toFixed(2)}</div>
                          {r.aiMessage && <div className="text-sm mt-1 leading-tight">{r.aiMessage}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {isPending && <div className="text-sm text-gray-500 italic">AI is thinking...</div>}
          </div>

          <form onSubmit={submitOffer} className="flex flex-col md:flex-row gap-2 items-end mt-4">
            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-black rounded px-3 py-2 text-lg w-32"
              placeholder="Your offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              disabled={reduxCompleted || isPending}
              required
            />
            <input
              type="text"
              className="border border-black rounded px-3 py-2 text-lg flex-1"
              placeholder="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={reduxCompleted || isPending}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold disabled:opacity-50"
              disabled={reduxCompleted || isPending}
            >
              {reduxCompleted ? "Done" : "Send"}
            </button>
          </form>

            {reduxCompleted && (
            <div className="text-center mt-4 border-t border-black/10 pt-4">
              {(reduxFinalPrice && reduxHistory.some(h => h.aiMessage?.includes("Deal!"))) || reduxFinalAccepted ? (
                <div className="text-xl font-black text-green-700 mb-2 uppercase tracking-tighter">Deal Finalized! 🎉</div>
              ) : (
                <div className="text-xl font-black text-red-600 mb-2 uppercase tracking-tighter">Negotiation Ended</div>
              )}
              <div className="mb-4 text-gray-700">Final Price: <span className="font-bold text-btn-main text-xl">${reduxFinalPrice?.toFixed(2)}</span></div>
              <div className="flex flex-wrap gap-4 justify-center">
                {(((reduxFinalPrice && reduxHistory.some(h => h.aiMessage?.includes("Deal!"))) || reduxFinalAccepted === true)) && (
                  <button className="px-8 py-3 rounded-2xl bg-btn-main border border-black text-white font-bold shadow-lg hover:bg-[#372b7c] transition-all transform hover:scale-[1.05]" onClick={() => navigate("/leaderboard")}>
                    Go to Leaderboard
                  </button>
                )}
                <button
                  onClick={() => {
                    reset()
                    setOffer("")
                    setMessage("")
                    setShowVideo(false)
                    setShowFinalChoice(false)
                    reduxSetFinalAccepted(null)
                    startNegotiation(product.id, Number(product.price), product.title, product.image)
                  }}
                  className="px-8 py-3 rounded-2xl bg-btn-main border border-black text-white font-bold shadow-lg hover:bg-[#372b7c] transition-all transform hover:scale-[1.05]"
                >
                  Start New Negotiation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFinalChoice && reduxFinalAccepted === null && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-bg-card border border-black rounded-3xl p-8 shadow-2xl text-center animate-fadeIn">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 border border-black shadow">
              <span className="text-3xl">🤝</span>
            </div>
            
            <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">Final Offer</h3>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Wait! I can't go lower than <span className="font-bold text-btn-main text-lg">${(reduxFinalPrice || (reduxHistory.length > 0 ? reduxHistory[reduxHistory.length - 1].aiCounter : 0))?.toFixed(2)}</span>. 
              Do you want to buy it at this price?
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="w-full py-3 rounded-2xl bg-btn-main border border-black text-white font-bold shadow-md hover:bg-[#372b7c] transition-all transform hover:scale-[1.02]"
                onClick={() => {
                  setShowFinalChoice(false)
                  reduxSetFinalAccepted(true)
                  acceptFinal()
                }}
              >
                Yes, I'll take it!
              </button>
              <button
                className="w-full py-3 rounded-2xl bg-white border border-black text-red-600 font-bold shadow-md hover:bg-gray-50 transition-all transform hover:scale-[1.02]"
                onClick={() => {
                  setShowFinalChoice(false)
                  reduxSetFinalAccepted(false)
                  setShowVideo(true)
                }}
              >
                No, Too Expensive
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideo && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              src="/gareeb.mp4"
              autoPlay
              controls
              className="w-full h-auto"
              onEnded={() => setShowVideo(false)}
            />
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 text-white text-2xl font-bold bg-black/50 w-10 h-10 rounded-full"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} src="/FAHH.mp3" preload="auto" />

      <style>{`
        :root {
          --bg-main: #d6c7fa;
          --bg-card: #f6f3ff;
          --accent: #ffd600;
          --btn-main: #4b3cc4;
        }
        .bg-bg-main { background-color: var(--bg-main) !important; }
        .bg-bg-card { background-color: var(--bg-card) !important; }
        .bg-accent { background-color: var(--accent) !important; }
        .bg-btn-main { background-color: var(--btn-main) !important; }
      `}</style>
    </div>
  )
}

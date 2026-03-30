import { useNegotiate } from "./hooks/useNegotiate"
import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Negotiate() {
  const {
    startNegotiation,
    makeOffer,
    reset,
    history: reduxHistory,
    completed: reduxCompleted,
    finalPrice: reduxFinalPrice,
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
  const [finalAccepted, setFinalAccepted] = useState(null) // null = not answered, true = yes, false = no
  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

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
          setTimeout(() => startNegotiation(prod.id, Number(prod.price)), 50)
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
        setTimeout(() => startNegotiation(data.id, Number(data.price)), 50)
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

    // Call backend API
    await makeOffer(userOffer, message)

    setOffer("")
    setMessage("")

    // We don't need to manually update local history/completed anymore,
    // as it will be synced from Redux in the next render.

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    }, 200)
  }

  const isPending = loading || reduxLoading
  const currentError = error || reduxError

  if (isPending && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg">
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
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg text-red-600">
        Product not found.
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
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[60vh] pb-2">
            {reduxHistory.map((h, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-end mb-2">
                  <div className="bg-btn-main text-white px-3 py-2 rounded-xl max-w-[80%]">
                    <b>You:</b> ${h.userOffer}
                    {h.userMessage && (
                      <div className="text-xs mt-1">{h.userMessage}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start mb-4">
                  <div className="bg-gray-200 text-black px-3 py-2 rounded-xl max-w-[80%]">
                    <b>AI:</b> ${h.aiCounter?.toFixed(2)}
                    {h.aiMessage && (
                      <div className="text-xs mt-1">{h.aiMessage}</div>
                    )}
                    {i > 0 &&
                      reduxHistory[i - 1].aiCounter > h.aiCounter &&
                      i !== reduxHistory.length - 1 && (
                        <div className="text-xs text-green-700 mt-1 font-semibold">
                          Price lessened by $
                          {(
                            reduxHistory[i - 1].aiCounter - h.aiCounter
                          ).toFixed(2)}
                        </div>
                      )}
                  </div>
                </div>
              </React.Fragment>
            ))}
            {isPending && (
              <div className="text-sm text-gray-500 italic">
                AI is thinking...
              </div>
            )}
          </div>
          <form
            onSubmit={submitOffer}
            className="flex flex-col md:flex-row gap-2 items-end mt-4"
          >
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
          <audio ref={audioRef} src="/FAHH.mp3" preload="auto" />
          <video ref={videoRef} src="/gareeb.mp4" style={{ display: "none" }} />
          {reduxCompleted && (
            <div className="text-center mt-4">
              {reduxFinalPrice && !reduxHistory.some(h => h.aiMessage?.toLowerCase().includes("deal")) ? (
                <div className="text-lg font-bold text-red-600 mb-2">
                  Negotiation Unsuccessful!
                </div>
              ) : (
                <div className="text-lg font-bold text-green-700 mb-2">
                  Negotiation Successful!
                </div>
              )}
              <div className="mb-2">
                Final Price:{" "}
                <span className="font-bold">
                  ${reduxFinalPrice?.toFixed(2)}
                </span>
              </div>
              {reduxFinalPrice &&
                reduxHistory.some((h) =>
                  h.aiMessage?.toLowerCase().includes("deal"),
                ) && (
                  <button
                    className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mt-2"
                    onClick={() => navigate("/leaderboard")}
                  >
                    Go to Leaderboard
                  </button>
                )}
              {showFinalChoice && finalAccepted === null && (
                <div className="mb-4">
                  <div className="text-base font-semibold mb-2">
                    Do you want to buy at this price?
                  </div>
                  <button
                    className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mr-2"
                    onClick={() => {
                      setShowFinalChoice(false)
                      setFinalAccepted(true)
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 border border-black text-white font-bold ml-2"
                    onClick={() => {
                      setShowFinalChoice(false)
                      setFinalAccepted(false)
                      setShowVideo(true)
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0
                          videoRef.current.play()
                        }
                      }, 200)
                    }}
                  >
                    No
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  reset()
                  setOffer("")
                  setMessage("")
                  setShowVideo(false)
                  setShowFinalChoice(false)
                  setFinalAccepted(null)
                  startNegotiation(product.id, Number(product.price))
                }}
                className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mt-2 ml-2"
              >
                Start New Negotiation
              </button>
              {showVideo && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.7)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <video
                    ref={videoRef}
                    src="/gareeb.mp4"
                    autoPlay
                    controls
                    style={{
                      maxWidth: "90vw",
                      maxHeight: "80vh",
                      background: "#000",
                    }}
                    onEnded={() => setShowVideo(false)}
                  />
                  <button
                    onClick={() => {
                      setShowVideo(false)
                      if (videoRef.current) videoRef.current.pause()
                    }}
                    style={{
                      position: "absolute",
                      top: 40,
                      right: 40,
                      fontSize: 32,
                      color: "#fff",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
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

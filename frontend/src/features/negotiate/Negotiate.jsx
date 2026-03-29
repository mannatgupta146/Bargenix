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
    // If productId is missing, try to recover from localStorage and update URL
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
    if (productId.includes("-x")) {
      // Try to load from all products in localStorage
      let found = false
      try {
        const allProducts = JSON.parse(
          localStorage.getItem("bargenix_all_products"),
        )
        if (Array.isArray(allProducts)) {
          const prod = allProducts.find((p) => p.id === productId)
          if (prod) {
            setProduct(prod)
            setAiPrice(Number(prod.price))
            setLoading(false)
            found = true
            return
          }
        }
      } catch (e) {}
      if (!found) {
        // Fallback: fetch and reconstruct products
        fetch("https://fakestoreapi.com/products")
          .then((res) => res.json())
          .then((data) => {
            let products = data
            if (products.length < 50) {
              const needed = 50 - products.length
              let extra = []
              for (let i = 0; i < needed; i++) {
                const base = products[i % products.length]
                extra.push({
                  ...base,
                  id: base.id + "-x" + (i + 1),
                  title: base.title + " (Var " + (i + 1) + ")",
                  price: (parseFloat(base.price) + (i + 1) * 1.11).toFixed(2),
                })
              }
              products = [...products, ...extra]
            }
            try {
              localStorage.setItem(
                "bargenix_all_products",
                JSON.stringify(products),
              )
            } catch (e) {}
            const prod = products.find((p) => p.id === productId)
            if (prod) {
              setProduct(prod)
              setAiPrice(Number(prod.price))
              setLoading(false)
            } else {
              setError(
                "Product not found. Please select again from the product list.",
              )
              setLoading(false)
            }
          })
          .catch(() => {
            setError(
              "Product not found. Please select again from the product list.",
            )
            setLoading(false)
          })
        return
      }
    }
    fetch(`https://fakestoreapi.com/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found")
        return res.json()
      })
      .then((data) => {
        setProduct(data)
        setAiPrice(Number(data.price))
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load product. Please try again later.")
        setLoading(false)
      })
  }, [location.search, navigate])

  const submitOffer = (e) => {
    e.preventDefault()
    if (!offer || isNaN(Number(offer)) || completed || round >= 5) return
    const userOffer = Number(offer)
    let newAiPrice = aiPrice
    let aiMsg = ""
    let playFahh = true
    const minPrice = Number(product.price) * 0.25
    const origPrice = Number(product.price)
    // Each round, AI drops by exactly 5% of original price, never more
    const drop = origPrice * 0.05
    let nextAiPrice = aiPrice - drop
    if (nextAiPrice < minPrice) nextAiPrice = minPrice
    newAiPrice = nextAiPrice
    if (newAiPrice <= userOffer) {
      aiMsg = `Deal! You got it for $${userOffer}`
    } else if (newAiPrice === minPrice) {
      aiMsg = "I can't go below this."
      playFahh = true
    } else {
      aiMsg = `I can do $${newAiPrice.toFixed(2)}. Can you go higher?`
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
    // After 5th attempt (round 4), always show Yes/No if user hasn't accepted
    if (round === 4) {
      if (userOffer >= minPrice) {
        setCompleted(true)
        setFinalPrice(minPrice)
        setShowFinalChoice(false)
        setFinalAccepted(true)
        return
      } else {
        setCompleted(true)
        setFinalPrice(newAiPrice)
        setShowFinalChoice(true)
        setFinalAccepted(null)
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
          }
        }, 200)
        return
      }
    }
    // If user accepts at any point before 5th round (AI price <= user offer and not at floor)
    if (newAiPrice <= userOffer && newAiPrice > minPrice) {
      setCompleted(true)
      setFinalPrice(newAiPrice)
      setShowFinalChoice(false)
      setFinalAccepted(true)
      return
    }
    setTimeout(() => {
      if (playFahh && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    }, 200)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg">
        Loading...
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-lg text-red-600">
        {error}
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
            {history.map((h, i) => (
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
                    <b>AI:</b> ${h.aiCounter.toFixed(2)}
                    {h.aiMessage && (
                      <div className="text-xs mt-1">{h.aiMessage}</div>
                    )}
                    {i > 0 &&
                      history[i - 1].aiCounter > h.aiCounter &&
                      i !== history.length - 1 && (
                        <div className="text-xs text-green-700 mt-1 font-semibold">
                          Price lessened by $
                          {(history[i - 1].aiCounter - h.aiCounter).toFixed(2)}
                        </div>
                      )}
                  </div>
                </div>
              </React.Fragment>
            ))}
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
              disabled={completed}
              required
            />
            <input
              type="text"
              className="border border-black rounded px-3 py-2 text-lg flex-1"
              placeholder="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={completed}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold"
              disabled={completed}
            >
              {completed ? "Done" : "Send"}
            </button>
          </form>
          <audio ref={audioRef} src="/FAHH.mp3" preload="auto" />
          <video ref={videoRef} src="/gareeb.mp4" style={{ display: "none" }} />
          {completed && (
            <div className="text-center mt-4">
              {finalAccepted === false ? (
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
                <span className="font-bold">${finalPrice?.toFixed(2)}</span>
              </div>
              {/* Final choice at 25% floor */}
              {showFinalChoice && finalAccepted === null && (
                <div className="mb-4">
                  <div className="text-base font-semibold mb-2">
                    Do you want to buy at this price (25% off)?
                  </div>
                  <button
                    className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mr-2"
                    onClick={() => {
                      setShowFinalChoice(false)
                      setFinalAccepted(true)
                      setTimeout(() => alert("Added to leaderboard!"), 100)
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
              {showFinalChoice && finalAccepted === true && (
                <div className="text-green-700 font-bold mb-2">
                  Added to leaderboard!
                </div>
              )}
              <button
                onClick={() => {
                  setHistory([])
                  setRound(0)
                  setAiPrice(Number(product.price))
                  setCompleted(false)
                  setFinalPrice(null)
                  setShowVideo(false)
                  setShowFinalChoice(false)
                  setFinalAccepted(null)
                }}
                className="px-4 py-2 rounded bg-btn-main border border-black text-white font-bold mt-2"
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

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ProductList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => {
        let products = data
        // If less than 50, duplicate and modify to fill up to 50
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
        setItems(products)
        try {
          localStorage.setItem(
            "bargenix_all_products",
            JSON.stringify(products),
          )
        } catch (e) {}
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to load products")
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex flex-col items-center py-10 px-4 min-h-screen bg-bg-main">
      <div className="w-full flex items-center justify-center mb-4 relative">
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
          <span
            style={{ display: "inline-block", width: 40, textAlign: "left" }}
          >
            Back
          </span>
        </button>
        <h1 className="text-3xl font-extrabold text-black">Products</h1>
      </div>
      <div className="mb-6 text-lg text-gray-800 max-w-2xl text-center">
        Select a product below to start bargaining with the AI seller. The lower
        your final deal, the higher you’ll rank!
      </div>
      {loading && <div className="text-lg text-gray-700">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {items.slice(0, 50).map((p) => (
          <div
            key={p.id}
            className="bg-bg-card rounded-2xl shadow-xl p-0 border-2 border-black flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-2xl group relative overflow-hidden"
            style={{ minHeight: 370 }}
          >
            <div className="w-full flex-1 flex flex-col items-center p-6">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-28 h-28 object-contain rounded bg-white border border-black mb-3 shadow group-hover:scale-105 transition"
                />
              )}
              <h2 className="text-lg font-extrabold text-black mb-1 text-center line-clamp-2">
                {p.title}
              </h2>
              <div className="text-xl font-bold text-btn-main mb-2">
                ${p.price}
              </div>
              {p.description && (
                <div className="text-xs text-gray-700 mb-2 line-clamp-3 text-center opacity-90">
                  {p.description}
                </div>
              )}
            </div>
            <button
              className="w-full py-3 rounded-b-2xl bg-btn-main border-t border-black text-white font-bold text-lg hover:bg-[#372b7c] transition shadow group-hover:scale-105"
              onClick={() => {
                // Store product in localStorage for reload support
                try {
                  localStorage.setItem(
                    "bargenix_selected_product",
                    JSON.stringify(p),
                  )
                } catch (e) {}
                navigate(`/negotiate?product=${p.id}`)
              }}
              style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
            >
              Negotiate
            </button>
            <div className="absolute inset-0 rounded-2xl border-black border-2 pointer-events-none z-10"></div>
            <div className="absolute inset-0 rounded-2xl bg-[repeating-linear-gradient(-45deg,_var(--stripe)_0px,_var(--stripe)_8px,_var(--btn-main)_8px,_var(--btn-main)_16px)] opacity-10 pointer-events-none z-0"></div>
          </div>
        ))}
      </div>
      {/* THEME for Products page */}
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

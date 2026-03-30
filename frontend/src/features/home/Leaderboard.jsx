import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchLeaderboard } from "./services/leaderboard.api"

export default function Leaderboard() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Poll leaderboard every 3 seconds for real-time updates
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await fetchLeaderboard()
        // Sort by bestPrice ascending (minimum at top)
        if (mounted) {
          setEntries(
            data.map((entry) => ({
              id: entry._id,
              username: entry.user?.name || "Unknown",
              bestPrice: entry.bestPrice,
              date: entry.date,
              productName: entry.productName,
              productImage: entry.productImage,
              originalPrice: entry.originalPrice,
              discountPercent: entry.discountPercent,
            })),
          )
          setLoading(false)
        }
      } catch (e) {
        setError("Failed to load leaderboard.")
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 3000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading)
    return <div className="p-8 text-center">Loading leaderboard...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center py-10 px-4">
      <button
        className="flex items-center gap-1 px-4 py-2 bg-btn-main text-white font-semibold rounded-2xl border-2 border-black hover:bg-[#372b7c] transition text-base shadow"
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
      <div className="w-full max-w-5xl bg-bg-card rounded-2xl shadow-xl border-2 border-black p-8 flex flex-col items-center">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-btn-main tracking-tight">
          🏆 Leaderboard
        </h2>
        {entries.length === 0 ? (
          <div className="text-lg text-gray-700 py-10">
            No deals yet. Negotiate to get on the leaderboard!
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main">
                  <th className="py-2 px-4 text-lg">Rank</th>
                  <th className="py-2 px-4 text-lg">User</th>
                  <th className="py-2 px-4 text-lg">Product</th>
                  <th className="py-2 px-4 text-lg">Actual Price ($)</th>
                  <th className="py-2 px-4 text-lg">Bought At ($)</th>
                  <th className="py-2 px-4 text-lg">Discount %</th>
                  <th className="py-2 px-4 text-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-accent/30 cursor-pointer transition ${idx === 0 ? "bg-accent/60 font-bold text-black" : ""}`}
                    onClick={() => setSelected(entry)}
                  >
                    <td className="py-2 px-4 text-center">{idx + 1}</td>
                    <td className="py-2 px-4">{entry.username}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2 max-w-[180px]">
                        {entry.productImage && (
                          <img src={entry.productImage} alt="" className="w-8 h-8 object-contain rounded border border-black/10 bg-white flex-shrink-0" />
                        )}
                        <span className="truncate flex-1">{entry.productName || "-"}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {entry.originalPrice
                        ? `$${entry.originalPrice.toFixed(2)}`
                        : "-"}
                    </td>
                    <td className="py-2 px-4">
                      {entry.bestPrice ? `$${entry.bestPrice.toFixed(2)}` : "-"}
                    </td>
                    <td className="py-2 px-4">
                      {entry.discountPercent !== undefined
                        ? `${entry.discountPercent.toFixed(1)}%`
                        : "-"}
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-500">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selected && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-bg-card rounded-2xl shadow-2xl border-2 border-btn-main p-8 min-w-[320px] max-w-[90vw] relative animate-fadeIn flex flex-col items-center">
              <button
                className="absolute top-3 right-3 text-2xl text-btn-main hover:text-red-600 font-bold"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-4 text-btn-main text-center">
                Deal Details
              </h3>
              {/* Product image if available */}
              {selected.productImage && (
                <img
                  src={selected.productImage}
                  alt={selected.productName}
                  className="w-28 h-28 object-contain rounded bg-white border border-black mb-3 shadow"
                />
              )}
              <div className="mb-2 text-lg">
                <b>User:</b> {selected.username}
              </div>
              <div className="mb-2 text-lg">
                <b>Product:</b> {selected.productName || "-"}
              </div>
              <div className="mb-2 text-lg">
                <b>Actual Price:</b>{" "}
                {selected.originalPrice
                  ? `$${selected.originalPrice.toFixed(2)}`
                  : "-"}
              </div>
              <div className="mb-2 text-lg">
                <b>Bought At:</b>{" "}
                {selected.bestPrice ? `$${selected.bestPrice.toFixed(2)}` : "-"}
              </div>
              <div className="mb-2 text-lg">
                <b>Discount %:</b>{" "}
                {selected.discountPercent !== undefined
                  ? `${selected.discountPercent.toFixed(1)}%`
                  : "-"}
              </div>
              <div className="mb-2 text-lg">
                <b>Date:</b>{" "}
                {selected.date ? new Date(selected.date).toLocaleString() : "-"}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* THEME for Leaderboard page */}
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

// API layer for negotiation endpoints

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/game"

export async function apiStartNegotiation() {
  const res = await fetch(`${API_BASE}/start`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Failed to start negotiation")
  return res.json()
}

export async function apiMakeOffer(sessionId, userOffer, userMessage) {
  const res = await fetch(`${API_BASE}/offer`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, userOffer, userMessage }),
  })
  if (!res.ok) throw new Error("Failed to make offer")
  return res.json()
}

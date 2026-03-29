// API for products
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/products"

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}`)
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function createProduct(product) {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error("Failed to create product")
  return res.json()
}

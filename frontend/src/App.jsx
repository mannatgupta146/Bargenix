import Leaderboard from "./features/home/Leaderboard.jsx"

import Login from "./features/auth/pages/Login.jsx"
import Register from "./features/auth/pages/Register.jsx"
import Protected from "./features/auth/components/Protected.jsx"
import Home from "./features/home/Home.jsx"
import Negotiate from "./features/negotiate/Negotiate.jsx"
import ProductList from "./features/products/ProductList.jsx"
import { useSelector } from "react-redux"
import { useEffect } from "react"
import { useAuth } from "./features/auth/hooks/useAuth"
import { Navigate, useNavigate, Routes, Route } from "react-router-dom"

export default function App() {
  // Persist user on reload
  const { loadUser } = useAuth()
  useEffect(() => {
    loadUser()
    // eslint-disable-next-line
  }, [])
  // Prevent logged-in users from accessing /login or /register
  function AuthRoute({ children }) {
    const user = useSelector((state) => state.auth.user)
    if (user) return <Navigate to="/" replace />
    return children
  }

  // Example profile page (protected)
  function Profile() {
    const user = useSelector((state) => state.auth.user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="w-full max-w-xs bg-bg-card rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center relative">
          <div className="w-14 h-14 bg-accent rounded-full border-2 border-black absolute -top-7 left-1/2 -translate-x-1/2"></div>
          <div className="w-full flex flex-col gap-6 mt-10">
            <div className="border-t border-black" />
            <div className="border-t border-black" />
            <h1 className="text-2xl font-bold text-center text-black mb-2">
              Profile
            </h1>
            <p className="text-center text-black mb-4">
              {user
                ? `Logged in as ${user.name || user.email}`
                : "No user info."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const navigate = useNavigate()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Home onStartNegotiation={() => navigate("/products")} />
          </Protected>
        }
      />
      <Route
        path="/products"
        element={
          <Protected>
            <ProductList />
          </Protected>
        }
      />
      <Route
        path="/negotiate"
        element={
          <Protected>
            <Negotiate />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <Profile />
          </Protected>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <Protected>
            <Leaderboard />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

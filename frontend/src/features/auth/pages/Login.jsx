import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const { user, login, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d6c7fa]">
      <div className="w-full max-w-xs bg-[#d6c7fa] rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center relative">
        <div className="w-14 h-14 bg-yellow-400 rounded-full border-2 border-black absolute -top-7 left-1/2 -translate-x-1/2"></div>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6 mt-10"
        >
          <div className="border-t border-black" />
          <div className="border-t border-black" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#a18aff]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#a18aff]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#4b3cc4] border-2 border-black text-white font-bold text-lg relative overflow-hidden flex items-center justify-center disabled:opacity-60"
          >
            <span className="absolute inset-0 flex items-center justify-center">
              {loading ? "Logging in..." : "Login"}
            </span>
            <span
              className="absolute inset-0 rounded-xl border-black border-2 pointer-events-none"
              style={{ zIndex: 1 }}
            ></span>
            <span
              className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(-45deg,#a18aff_0px,_#a18aff_8px,_#4b3cc4_8px,_#4b3cc4_16px)] opacity-30 pointer-events-none"
              style={{ zIndex: 0 }}
            ></span>
          </button>
          {error && (
            <div className="text-red-600 text-sm text-center font-bold">
              {error}
            </div>
          )}
        </form>
        <p className="mt-6 text-center text-black">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="underline text-[#4b3cc4] font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

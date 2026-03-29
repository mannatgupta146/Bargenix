import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
  const { user, register, loading, error } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  // Redirect to login after successful register
  const [registered, setRegistered] = useState(false)
  useEffect(() => {
    if (registered) navigate("/login")
  }, [registered, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await register(name, email, password)
    setRegistered(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="w-full max-w-xs bg-bg-card rounded-2xl shadow-xl p-8 border border-black flex flex-col items-center relative">
        <div className="w-14 h-14 bg-accent rounded-full border-2 border-black absolute -top-7 left-1/2 -translate-x-1/2"></div>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6 mt-10"
        >
          <div className="border-t border-black" />
          <div className="border-t border-black" />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#a18aff]"
          />
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
            className="w-full py-4 rounded-xl bg-btn-main border-2 border-black text-white font-bold text-lg relative overflow-hidden flex items-center justify-center disabled:opacity-60"
          >
            <span className="absolute inset-0 flex items-center justify-center">
              {loading ? "Registering..." : "Register"}
            </span>
            <span
              className="absolute inset-0 rounded-xl border-black border-2 pointer-events-none"
              style={{ zIndex: 1 }}
            ></span>
            <span
              className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(-45deg,_var(--stripe)_0px,_var(--stripe)_8px,_var(--btn-main)_8px,_var(--btn-main)_16px)] opacity-30 pointer-events-none"
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
          Already have an account?{" "}
          <Link to="/login" className="underline text-btn-main font-semibold">
            Login
          </Link>
        </p>
      </div>
      <style>{`
        :root {
          --bg-main: #d6c7fa;
          --bg-card: #d6c7fa;
          --accent: #ffd600;
          --btn-main: #4b3cc4;
          --stripe: #a18aff;
        }
        .bg-bg-main { background-color: var(--bg-main); }
        .bg-bg-card { background-color: var(--bg-card); }
        .bg-accent { background-color: var(--accent); }
        .bg-btn-main { background-color: var(--btn-main); }
        .text-btn-main { color: var(--btn-main); }
      `}</style>
    </div>
  )
}

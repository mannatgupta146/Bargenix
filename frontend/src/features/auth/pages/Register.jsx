import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
  const { user, register, loading, error } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])


  const handleSubmit = async (e) => {
    e.preventDefault()
    await register(name, email, password)
    // Navigate to login with success state
    navigate("/login", { state: { message: "Account created! Please log in." } })
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
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#a18aff] pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
              className="absolute inset-0 rounded-xl bg-[repeating-linear-gradient(-45deg,var(--stripe)_0px,var(--stripe)_8px,var(--btn-main)_8px,var(--btn-main)_16px)] opacity-30 pointer-events-none"
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
// Eye and EyeOff SVG icons
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
)
const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3l18 18M4.5 4.5C2.25 7.5 2.25 12 2.25 12s3.75 7.5 9.75 7.5c2.25 0 4.25-.5 6-1.5M19.5 19.5C21.75 16.5 21.75 12 21.75 12s-3.75-7.5-9.75-7.5c-1.5 0-2.93.22-4.25.63"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
)

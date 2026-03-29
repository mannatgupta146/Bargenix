import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"

export default function Protected({ children }) {
  const { user, loading } = useSelector((state) => state.auth)
  const location = useLocation()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d6c7fa]">
        <div className="text-lg font-bold text-[#4b3cc4]">Loading...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

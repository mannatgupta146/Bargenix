import { useDispatch, useSelector } from "react-redux"
import {
  setUser,
  setLoading,
  setError,
  logout as logoutAction,
} from "../auth.slice"
import * as api from "../services/auth.api"
import { useCallback } from "react"

export function useAuth() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)

  const login = useCallback(
    async (email, password) => {
      dispatch(setLoading(true))
      try {
        const data = await api.login(email, password)
        dispatch(setUser(data))
        // Persist user to localStorage
        localStorage.setItem("bargenix_user", JSON.stringify(data))
      } catch (err) {
        dispatch(setError(err.response?.data?.message || "Login failed"))
      } finally {
        dispatch(setLoading(false))
      }
    },
    [dispatch],
  )

  // Register should NOT log in user automatically
  const register = useCallback(
    async (name, email, password) => {
      dispatch(setLoading(true))
      try {
        await api.register(name, email, password)
        // No setUser here; let page handle navigation
      } catch (err) {
        dispatch(setError(err.response?.data?.message || "Register failed"))
      } finally {
        dispatch(setLoading(false))
      }
    },
    [dispatch],
  )

  const logout = useCallback(async () => {
    await api.logout()
    dispatch(logoutAction())
    localStorage.removeItem("bargenix_user")
  }, [dispatch])

  // Load user from localStorage or backend (for session persistence)
  const loadUser = useCallback(async () => {
    dispatch(setLoading(true))
    let found = false
    // Try localStorage first
    const stored = localStorage.getItem("bargenix_user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user && user.email) {
          dispatch(setUser(user))
          found = true
        }
      } catch {}
    }
    // Always check backend for a valid session
    try {
      const data = await api.getProfile()
      if (data && data.email) {
        dispatch(setUser(data))
        found = true
        // Update localStorage with fresh data
        localStorage.setItem("bargenix_user", JSON.stringify(data))
      }
    } catch (err) {
      dispatch(logoutAction())
      localStorage.removeItem("bargenix_user")
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  return { user, loading, error, login, register, logout, loadUser }
}

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
  }, [dispatch])

  // Load user from backend (for session persistence)
  const loadUser = useCallback(async () => {
    dispatch(setLoading(true))
    try {
      const data = await api.getProfile()
      dispatch(setUser(data))
    } catch (err) {
      dispatch(logoutAction())
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  return { user, loading, error, login, register, logout, loadUser }
}

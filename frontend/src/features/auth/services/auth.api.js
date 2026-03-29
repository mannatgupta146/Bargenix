import axios from "axios"

const API_URL = "http://localhost:3000/api/auth"

export const login = async (email, password) => {
  const res = await axios.post(
    `${API_URL}/login`,
    { email, password },
    { withCredentials: true },
  )
  return res.data
}

export const register = async (name, email, password) => {
  const res = await axios.post(
    `${API_URL}/register`,
    { name, email, password },
    { withCredentials: true },
  )
  return res.data
}

export const logout = async () => {
  await axios.post(`${API_URL}/logout`, {}, { withCredentials: true })
}

export const getProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`, { withCredentials: true })
  return res.data
}

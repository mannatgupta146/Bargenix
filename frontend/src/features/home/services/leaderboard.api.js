import axios from "axios"

const API_URL = "http://localhost:3000/api/game"

export const fetchLeaderboard = async () => {
  const res = await axios.get(`${API_URL}/leaderboard`, {
    withCredentials: true,
  })
  return res.data
}

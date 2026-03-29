import express from "express"
import { protect } from "../middlewares/auth.middleware.js"
import {
  startNegotiation,
  makeOffer,
  getLeaderboard,
} from "../controllers/game.controller.js"

const router = express.Router()

// Start a new negotiation session
router.post("/start", protect, startNegotiation)

// Make an offer in a negotiation round
router.post("/offer", protect, makeOffer)

// Get leaderboard
router.get("/leaderboard", getLeaderboard)

export default router

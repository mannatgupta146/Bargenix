import NegotiationSession from "../models/negotiationSession.model.js"
import LeaderboardEntry from "../models/leaderboardEntry.model.js"

// Helper: Generate random AI constraints
function generateAIConstraints() {
  return {
    minPrice: Math.floor(Math.random() * 50) + 50, // 50-99
    targetProfit: Math.floor(Math.random() * 20) + 10, // 10-29
    strategy: "standard", // Placeholder for future strategies
  }
}

// Start a new negotiation session
export const startNegotiation = async (req, res) => {
  try {
    const aiConstraints = generateAIConstraints()
    const session = await NegotiationSession.create({
      user: req.user._id,
      aiConstraints,
    })
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Make an offer in a negotiation round
export const makeOffer = async (req, res) => {
  try {
    const { sessionId, userOffer } = req.body
    const session = await NegotiationSession.findById(sessionId)
    if (!session || session.completed) {
      return res.status(400).json({ message: "Invalid or completed session" })
    }
    // Simple AI logic: counter-offer is max(userOffer + 5, minPrice)
    const { minPrice } = session.aiConstraints
    let aiCounter = Math.max(userOffer + 5, minPrice)
    if (userOffer >= minPrice) aiCounter = userOffer
    session.rounds.push({ userOffer, aiCounter })
    // If user meets or beats minPrice, negotiation ends
    if (userOffer >= minPrice) {
      session.finalPrice = userOffer
      session.completed = true
      // Update leaderboard
      let entry = await LeaderboardEntry.findOne({ user: req.user._id })
      if (!entry || userOffer < entry.bestPrice) {
        await LeaderboardEntry.findOneAndUpdate(
          { user: req.user._id },
          { bestPrice: userOffer, date: new Date() },
          { upsert: true, new: true },
        )
      }
    }
    await session.save()
    res.json({
      aiCounter,
      completed: session.completed,
      finalPrice: session.finalPrice,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const top = await LeaderboardEntry.find()
      .sort({ bestPrice: 1 })
      .limit(10)
      .populate("user", "name")
    res.json(top)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

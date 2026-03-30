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
    const { productId } = req.body
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }
    const aiConstraints = generateAIConstraints()
    const session = await NegotiationSession.create({
      user: req.user._id,
      product: productId,
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
    const { sessionId, userOffer, userMessage } = req.body
    const session = await NegotiationSession.findById(sessionId)
    if (!session || session.completed) {
      return res.status(400).json({ message: "Invalid or completed session" })
    }
    // Get starting price from first round or set default
    let startingPrice = 100
    if (session.rounds.length > 0) {
      startingPrice = session.rounds[0].aiCounter || 100
    } else if (session.aiConstraints && session.aiConstraints.minPrice) {
      startingPrice = Math.round(session.aiConstraints.minPrice / 0.75)
    }
    // Enforce 25% minimum discount
    const minAllowed = Math.round(startingPrice * 0.75)
    const { minPrice } = session.aiConstraints
    const trueMin = Math.max(minPrice, minAllowed)
    // AI logic: counter-offer is max(userOffer + 5, trueMin)
    let aiCounter = Math.max(userOffer + 5, trueMin)
    if (userOffer >= trueMin) aiCounter = userOffer

    // AI message logic
    let aiMessage = "That's still too low for me. Can you do a bit better?"
    if (userOffer < trueMin) {
      aiMessage = `Sorry, I can't go below $${trueMin}. Can you increase your offer?`
    } else if (userOffer >= trueMin && !session.completed) {
      aiMessage = `Deal! You got it for $${userOffer}.`
    }

    session.rounds.push({
      userOffer,
      userMessage,
      aiCounter,
      aiMessage,
    })

    // If user meets or beats min price, negotiation ends
    if (userOffer >= trueMin) {
      session.finalPrice = userOffer
      session.completed = true
      // Update leaderboard with product info
      // Try to get product info from session.product (should be productId)
      let productId = session.product
      let productName = "Unknown"
      let productImage = ""
      let originalPrice = startingPrice
      let discountPercent = 0
      try {
        if (productId) {
          const Product = (await import("../models/product.model.js")).default
          const prod = await Product.findOne({ _id: productId })
          if (prod) {
            productName = prod.name
            originalPrice = prod.price
            productImage = prod.image || ""
          }
        }
      } catch (e) {}
      if (originalPrice && userOffer) {
        discountPercent = ((originalPrice - userOffer) / originalPrice) * 100
      }
      // Always create a new leaderboard entry for every successful negotiation
      const entryData = {
        user: req.user._id,
        productId: productId || "unknown",
        productName,
        productImage,
        originalPrice,
        bestPrice: userOffer,
        discountPercent,
        date: new Date(),
      }
      console.log("[Leaderboard] Creating entry:", entryData)
      await LeaderboardEntry.create(entryData)
    }
    await session.save()
    res.json({
      aiCounter,
      aiMessage,
      completed: session.completed,
      finalPrice: session.finalPrice,
      round: session.rounds[session.rounds.length - 1],
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    let entries = await LeaderboardEntry.find().populate("user", "name")
    // Calculate discount percentage for each entry
    entries = entries.map((entry) => {
      let percent = 0
      if (entry.originalPrice && entry.bestPrice) {
        percent =
          ((entry.originalPrice - entry.bestPrice) / entry.originalPrice) * 100
      }
      return {
        ...entry.toObject(),
        discountPercent: percent,
      }
    })
    // Sort: highest discount (lowest price) at top, then by bestPrice
    entries.sort((a, b) => {
      // Sort by discount descending, then by bestPrice ascending
      if (b.discountPercent !== a.discountPercent) {
        return b.discountPercent - a.discountPercent
      }
      return a.bestPrice - b.bestPrice
    })
    // Show all entries (no limit)
    res.json(entries)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

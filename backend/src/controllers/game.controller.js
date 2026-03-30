import NegotiationSession from "../models/negotiationSession.model.js"
import LeaderboardEntry from "../models/leaderboardEntry.model.js"

// Helper: Generate AI constraints relative to product price
function generateAIConstraints(basePrice = 100) {
  // Use 75% of base price as the absolute floor (25% discount)
  const minPrice = Math.round(basePrice * 0.75)
  return {
    startingPrice: basePrice,
    minPrice,
    targetProfit: 10,
    strategy: "standard",
  }
}

// Start a new negotiation session
export const startNegotiation = async (req, res) => {
  try {
    const { productId, basePrice: reqBasePrice } = req.body
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    let actualPrice = reqBasePrice || 100
    try {
      const Product = (await import("../models/product.model.js")).default
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(productId)
      let prod = null
      if (isObjectId) {
        prod = await Product.findById(productId)
      } else {
        prod = await Product.findOne({ _id: productId })
      }
      if (prod) {
        actualPrice = prod.price
      }
    } catch (e) {}

    const aiConstraints = generateAIConstraints(actualPrice)
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

    const { startingPrice, minPrice } = session.aiConstraints
    const roundNumber = session.rounds.length + 1

    if (roundNumber > 5) {
      return res.status(400).json({ message: "Maximum negotiation rounds reached" })
    }

    // AI logic: Counter-offer drops by exactly 5% of starting price each round
    // Round 1: 95%, Round 2: 90%, ..., Round 5: 75%
    const discountPercent = Math.min(0.05 * roundNumber, 0.25)
    let aiCounter = Math.round(startingPrice * (1 - discountPercent))

    // Ensure AI never goes below minPrice
    aiCounter = Math.max(aiCounter, minPrice)

    let isDeal = false
    if (userOffer >= aiCounter) {
      aiCounter = userOffer
      isDeal = true
    }

    // AI message logic: vary the response to be less repetitive
    let aiMessage = `I can do $${aiCounter.toFixed(2)}. What do you think?`
    
    const hasWarned = session.rounds.some(r => r.aiMessage && r.aiMessage.includes("can't go below"))
    
    if (userOffer < minPrice) {
      if (roundNumber === 1) {
        aiMessage = `That's quite low! How about $${aiCounter.toFixed(2)}?`
      } else if (!hasWarned || roundNumber === 5) {
        aiMessage = `Sorry, I can't go below $${minPrice.toFixed(2)}. Can you increase your offer?`
      } else {
        aiMessage = `That's still too low. My best offer stands at $${aiCounter.toFixed(2)}.`
      }
    }

    if (isDeal) {
      aiMessage = `Deal! You got it for $${userOffer}.`
    } else if (roundNumber === 5) {
      aiMessage = `This is my absolute lowest: $${aiCounter.toFixed(2)}. It's a final offer.`
    }

    session.rounds.push({
      userOffer,
      userMessage,
      aiCounter,
      aiMessage,
    })

    // Negotiation ends if deal reached OR it's the 5th round
    if (isDeal || roundNumber === 5) {
      session.completed = true
      if (isDeal) {
        session.finalPrice = userOffer
        // Update leaderboard with product info
        let productId = session.product
        let productName = "Unknown"
        let productImage = ""
        let originalPriceFromDb = startingPrice
        let discountPercentValue = 0
        try {
          if (productId) {
            const Product = (await import("../models/product.model.js")).default
            let prod = null
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(productId)
            if (isObjectId) {
              prod = await Product.findById(productId)
            } else {
              prod = await Product.findOne({
                $or: [{ _id: productId }, { name: new RegExp(productId, "i") }],
              })
            }
            if (prod) {
              productName = prod.name
              originalPriceFromDb = prod.price
              productImage = prod.image || ""
            }
          }
        } catch (e) {
          console.error("[Leaderboard] Product lookup error:", e.message)
        }

        const finalOriginalPrice = originalPriceFromDb || startingPrice
        if (finalOriginalPrice && userOffer) {
          discountPercentValue =
            ((finalOriginalPrice - userOffer) / finalOriginalPrice) * 100
        }

        const entryData = {
          user: req.user._id,
          productId: productId || "unknown",
          productName,
          productImage,
          originalPrice: finalOriginalPrice,
          bestPrice: userOffer,
          discountPercent: discountPercentValue,
          date: new Date(),
        }
        console.log("[Leaderboard] Creating entry:", entryData)
        await LeaderboardEntry.create(entryData)
      } else {
        // Round 5 reached without deal, set finalPrice to AI's last offer 
        // to show what was offered, but it's not a 'deal' yet unless user accepts it
        // actually we just leave finalPrice undefined or set it to aiCounter
        session.finalPrice = aiCounter 
      }
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

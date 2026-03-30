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
// Initialize a negotiation session
export const startNegotiation = async (req, res) => {
  try {
    const { productId, basePrice, productName, productImage } = req.body
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    const actualPrice = Number(basePrice) || 100
    const aiConstraints = generateAIConstraints(actualPrice)

    const session = new NegotiationSession({
      user: req.user._id,
      product: productId,
      productName: productName || "Unknown Product",
      productImage: productImage || "",
      aiConstraints,
      rounds: [],
    })

    await session.save()
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Helper: Create Leaderboard Entry
async function createLeaderboardEntry(req, session, finalPrice, originalPriceFromConstraints) {
  let productId = session.product
  let productName = session.productName || "Unknown"
  let productImage = session.productImage || ""
  let originalPriceFromDb = originalPriceFromConstraints
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

  const finalOriginalPrice = originalPriceFromDb || originalPriceFromConstraints
  if (finalOriginalPrice && finalPrice) {
    discountPercentValue =
      ((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100
  }

  const entryData = {
    user: req.user._id,
    productId: productId || "unknown",
    productName,
    productImage,
    originalPrice: finalOriginalPrice,
    bestPrice: finalPrice,
    discountPercent: discountPercentValue,
    date: new Date(),
  }
  console.log("[Leaderboard] Creating entry:", entryData)
  return await LeaderboardEntry.create(entryData)
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
    const discountPercent = Math.min(0.05 * roundNumber, 0.25)
    let aiCounter = Math.round(startingPrice * (1 - discountPercent))
    aiCounter = Math.max(aiCounter, minPrice)

    let isDeal = false
    if (userOffer >= aiCounter) {
      aiCounter = userOffer
      isDeal = true
    }

    // AI message logic
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
      aiMessage = `Deal! You got it for $${aiCounter}.`
    } else if (roundNumber === 5) {
      aiMessage = `This is my absolute lowest: $${aiCounter.toFixed(2)}. It's a final offer.`
    }

    session.rounds.push({ userOffer, userMessage, aiCounter, aiMessage })

    if (isDeal || roundNumber === 5) {
      session.completed = true
      session.finalPrice = aiCounter
      if (isDeal) {
        await createLeaderboardEntry(req, session, aiCounter, startingPrice)
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

// Accept the final offer
export const acceptFinalOffer = async (req, res) => {
  try {
    const { sessionId } = req.body
    const session = await NegotiationSession.findById(sessionId)
    if (!session) return res.status(404).json({ message: "Session not found" })
    
    // Record as deal in leaderboard if not already recorded
    const isAlreadyDeal = session.rounds.some(r => r.aiMessage && r.aiMessage.includes("Deal!"))
    if (!isAlreadyDeal && session.finalPrice) {
      await createLeaderboardEntry(req, session, session.finalPrice, session.aiConstraints.startingPrice)
    }

    session.completed = true
    await session.save()
    res.json({ message: "Final offer accepted!", session })
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

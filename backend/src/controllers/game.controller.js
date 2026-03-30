import NegotiationSession from "../models/negotiationSession.model.js"
import Product from "../models/product.model.js"
import LeaderboardEntry from "../models/leaderboardEntry.model.js"

// Helper: Create Leaderboard Entry
async function createLeaderboardEntry(req, session, priceValue, originalPriceValue) {
  const finalPrice = Number(priceValue)
  let finalOriginalPrice = Number(originalPriceValue)
  let discountPercentValue = 0

  const productId = session.product
  let productName = session.productName || "Unknown"
  let productImage = session.productImage || ""

  console.log(`[Leaderboard] STARTING creation for user ${req.user?._id} and product ${productId}`)
  try {
    if (productId) {
      // Safely try to find product if it looks like a valid MongoDB ID
      try {
        const isOid = productId.length === 24 && /^[0-9a-fA-F]+$/.test(productId)
        if (isOid) {
          const prod = await Product.findById(productId)
          if (prod) {
            productName = prod.name
            finalOriginalPrice = Number(prod.price)
            productImage = prod.image || ""
            console.log(`[Leaderboard] Local product found: ${productName}`)
          }
        }
      } catch (e) {
        console.log(`[Leaderboard] Product lookup skipped for ID: ${productId}`)
      }
    }
    
    if (finalOriginalPrice > 0) {
      discountPercentValue = ((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100
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
    console.log(`[Leaderboard] FINAL ENTRY DATA:`, JSON.stringify(entryData, null, 2))
    const newEntry = await LeaderboardEntry.create(entryData)
    console.log(`[Leaderboard] SUCCESS: Entry created with ID ${newEntry._id}`)
    return newEntry
  } catch (err) {
    console.error("[Leaderboard] CRITICAL ERROR during creation:", err)
  }
}

// Start a new negotiation session
export const startNegotiation = async (req, res) => {
  try {
    const { productId, basePrice, productName, productImage } = req.body
    
    // Generate AI constraints based on basePrice
    const startingPrice = basePrice || 100
    const minPrice = startingPrice * 0.75 // 25% max discount
    
    const session = new NegotiationSession({
      user: req.user._id,
      product: productId,
      productName,
      productImage,
      aiConstraints: {
        startingPrice,
        minPrice
      }
    })
    
    await session.save()
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Make an offer
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

// Accept final offer (Yes on modal)
export const acceptFinalOffer = async (req, res) => {
  try {
    const { sessionId } = req.body
    const session = await NegotiationSession.findById(sessionId)
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

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
    console.log(`[Leaderboard] Found ${entries.length} total entries in DB`)
    if (entries.length > 0) {
      console.log(`[Leaderboard] Latest 3 entries (raw IDs):`, entries.slice(-3).map(e => e._id))
    }
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
    // Sort: Highest discount first
    entries.sort((a, b) => {
      if (Math.abs(b.discountPercent - a.discountPercent) > 0.1) {
        return b.discountPercent - a.discountPercent
      }
      return a.bestPrice - b.bestPrice
    })
    res.json(entries)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

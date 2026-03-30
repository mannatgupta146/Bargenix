import mongoose from "mongoose"

const negotiationSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: String,
      required: true,
      default: "Fixed Product",
    },
    aiConstraints: {
      startingPrice: { type: Number, required: true },
      minPrice: { type: Number, required: true },
      targetProfit: { type: Number, required: true },
      strategy: { type: String, required: true },
    },
    rounds: [
      {
        userOffer: Number,
        userMessage: String,
        aiCounter: Number,
        aiMessage: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    finalPrice: Number,
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const NegotiationSession = mongoose.model(
  "NegotiationSession",
  negotiationSessionSchema,
)

export default NegotiationSession

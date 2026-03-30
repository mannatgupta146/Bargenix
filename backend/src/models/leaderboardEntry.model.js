import mongoose from "mongoose"

const leaderboardEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: false,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    bestPrice: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const LeaderboardEntry = mongoose.model(
  "LeaderboardEntry",
  leaderboardEntrySchema,
)

export default LeaderboardEntry

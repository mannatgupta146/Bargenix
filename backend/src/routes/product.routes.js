import express from "express"
import {
  createProduct,
  getProducts,
} from "../controllers/product.controller.js"
import { protect } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Anyone can view products
router.get("/", getProducts)
// Only authenticated users can add products
router.post("/", protect, createProduct)

export default router

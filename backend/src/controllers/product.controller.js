import Product from "../models/product.model.js"

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image } = req.body
    const product = await Product.create({ name, price, description, image })
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

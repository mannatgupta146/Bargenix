import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchProducts, createProduct } from "./services/products.api"

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProducts()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const createProductThunk = createAsyncThunk(
  "products/create",
  async (product, { rejectWithValue }) => {
    try {
      return await createProduct(product)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true
        state.error = ""
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch products"
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
  },
})

export default productsSlice.reducer

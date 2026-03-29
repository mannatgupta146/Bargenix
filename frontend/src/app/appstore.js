import { configureStore } from "@reduxjs/toolkit"

import authReducer from "../features/auth/auth.slice"

import negotiateReducer from "../features/negotiate/negotiate.slice"
import productsReducer from "../features/products/products.slice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    negotiate: negotiateReducer,
    products: productsReducer,
  },
})

export default store

import { configureStore } from "@reduxjs/toolkit"

import authReducer from "../features/auth/auth.slice"
import negotiateReducer from "../features/negotiate/negotiate.slice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    negotiate: negotiateReducer,
  },
})

export default store

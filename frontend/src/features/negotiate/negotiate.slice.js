import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiStartNegotiation, apiMakeOffer } from "./services/negotiate.api"

export const startNegotiationThunk = createAsyncThunk(
  "negotiate/startNegotiation",
  async (_, { rejectWithValue }) => {
    try {
      return await apiStartNegotiation()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const makeOfferThunk = createAsyncThunk(
  "negotiate/makeOffer",
  async ({ offer, message }, { getState, rejectWithValue }) => {
    try {
      const sessionId = getState().negotiate.session?._id
      return await apiMakeOffer(sessionId, offer, message)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  session: null,
  history: [],
  loading: false,
  error: "",
  completed: false,
  finalPrice: null,
}

const negotiateSlice = createSlice({
  name: "negotiate",
  initialState,
  reducers: {
    resetNegotiation: (state) => {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNegotiationThunk.pending, (state) => {
        state.loading = true
        state.error = ""
      })
      .addCase(startNegotiationThunk.fulfilled, (state, action) => {
        state.loading = false
        state.session = action.payload
        state.history = []
        state.completed = false
        state.finalPrice = null
      })
      .addCase(startNegotiationThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to start negotiation"
      })
      .addCase(makeOfferThunk.pending, (state) => {
        state.loading = true
        state.error = ""
      })
      .addCase(makeOfferThunk.fulfilled, (state, action) => {
        state.loading = false
        // Store full round info (user/AI message, price)
        if (action.payload && action.payload.round) {
          state.history.push(action.payload.round)
        }
        if (action.payload.completed) {
          state.completed = true
          state.finalPrice = action.payload.finalPrice
        }
      })
      .addCase(makeOfferThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Offer failed"
      })
  },
})

export const { resetNegotiation } = negotiateSlice.actions
export default negotiateSlice.reducer

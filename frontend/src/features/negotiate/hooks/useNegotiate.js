import { useDispatch, useSelector } from "react-redux"
import {
  startNegotiationThunk,
  makeOfferThunk,
  acceptFinalOfferThunk,
  resetNegotiation,
  setFinalAccepted,
} from "../negotiate.slice"

export function useNegotiate() {
  const dispatch = useDispatch()
  const state = useSelector((s) => s.negotiate)

  const startNegotiation = (productId, basePrice, productName, productImage) =>
    dispatch(startNegotiationThunk({ productId, basePrice, productName, productImage }))

  const makeOffer = (offer, message) =>
    dispatch(makeOfferThunk({ offer, message }))

  const acceptFinal = () => {
    if (state.session?._id) {
      dispatch(acceptFinalOfferThunk(state.session._id))
    }
  }

  const reset = () => dispatch(resetNegotiation())

  return {
    ...state,
    startNegotiation,
    makeOffer,
    acceptFinal,
    reset,
    setFinalAccepted: (val) => dispatch(setFinalAccepted(val)),
  }
}

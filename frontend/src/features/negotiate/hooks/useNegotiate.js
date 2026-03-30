import { useDispatch, useSelector } from "react-redux"
import {
  startNegotiationThunk,
  makeOfferThunk,
  resetNegotiation,
} from "../negotiate.slice"

export function useNegotiate() {
  const dispatch = useDispatch()
  const state = useSelector((s) => s.negotiate)

  const startNegotiation = (productId, basePrice) =>
    dispatch(startNegotiationThunk({ productId, basePrice }))
  const makeOffer = (offer, message) =>
    dispatch(makeOfferThunk({ offer, message }))
  const reset = () => dispatch(resetNegotiation())

  return {
    ...state,
    startNegotiation,
    makeOffer,
    reset,
  }
}

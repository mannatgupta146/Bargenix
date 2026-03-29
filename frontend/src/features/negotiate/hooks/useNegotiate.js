import { useDispatch, useSelector } from "react-redux"
import {
  startNegotiationThunk,
  makeOfferThunk,
  resetNegotiation,
} from "../negotiate.slice"

export function useNegotiate() {
  const dispatch = useDispatch()
  const state = useSelector((s) => s.negotiate)

  const startNegotiation = () => dispatch(startNegotiationThunk())
  const makeOffer = (offer) => dispatch(makeOfferThunk(offer))
  const reset = () => dispatch(resetNegotiation())

  return {
    ...state,
    startNegotiation,
    makeOffer,
    reset,
  }
}

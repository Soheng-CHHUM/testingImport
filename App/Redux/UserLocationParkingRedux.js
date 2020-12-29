import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  registerLocationRequest: ['parkingData'],
  removeLocationRequest: [],
})

export const GithubTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  parkingData: null
})

/* ------------- Reducers ------------- */

// request the avatar for a user
export const registerLocation = (state, { parkingData }) =>
  state.merge({ parkingData })

export const removeLocation = (state) =>{
  return state.merge({ parkingData: null })
}
/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.REGISTER_LOCATION_REQUEST]: registerLocation,
  [Types.REMOVE_LOCATION_REQUEST]: removeLocation,
})

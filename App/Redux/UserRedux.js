import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  getUserRequest: [],
  storeUserRequest: ['status', 'userData'],
})

export const GithubTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  status: null,
  userData: null
})

/* ------------- Reducers ------------- */

// request the avatar for a user
export const storeUser = (state, { status, userData }) =>
  state.merge({ status, userData })

export const getUser = (state) =>{
  return state.merge({ status: state.status, userData: state.userData })
}
/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.GET_USER_REQUEST]: getUser,
  [Types.STORE_USER_REQUEST]: storeUser,
})

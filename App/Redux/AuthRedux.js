import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  authSetNbUnreadMessages: ['payload'],
  authSetUser: ['payload'],
  authLoad: null,
  authReset: [],
})

export const AuthTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  user: null,
  nbUnreadMessages: 0
})

/* ------------- Selectors ------------- */

export const AuthSelectors = {
  getData: state => state.data,
  getUser: state => state.user
}

export const selectUser = AuthSelectors.getUser

/* ------------- Reducers ------------- */

export const setNbUnreadMessages = (state, {payload}) => {
  return state.merge({ nbUnreadMessages: payload })
}

export const setUser = (state, {payload}) => {
  return state.merge({ user: payload })
}

export const resetAuth = (state) => {
  return state.merge({ user: null })
}

export const load = (state) => state.merge({ loading: true })

export const loadSuccess = (state) => state.merge({ loading: false })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.AUTH_LOAD]: load,
  [Types.AUTH_SET_NB_UNREAD_MESSAGES]: setNbUnreadMessages,
  [Types.AUTH_SET_USER]: setUser,
  [Types.AUTH_RESET]: resetAuth,
})

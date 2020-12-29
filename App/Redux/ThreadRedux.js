import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  setThread: ['data'],
})

export const ThreadTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  current: null,
})

/* ------------- Selectors ------------- */

export const ThreadSelectors = {
  getData: state => state.data
}

/* ------------- Reducers ------------- */

export const setThread = (state, { data }) =>
  state.merge({ current: data })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_THREAD]: setThread
})

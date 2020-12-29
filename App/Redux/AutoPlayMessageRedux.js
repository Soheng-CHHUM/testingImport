import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  autoPlayMessageAdd: ['payload']
})

export const AutoPlayMessageTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  data: []
})

/* ------------- Selectors ------------- */

export const AutoPlayMessageSelectors = {
  getData: state => state.data
}

/* ------------- Reducers ------------- */

// successful api lookup
export const addMessage = (state, action) => {
  const { payload } = action
  
  let data = state.data ? state.data.concat([payload]) : [payload]

  return state.merge({ data })
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.AUTO_PLAY_MESSAGE_ADD]: addMessage
})

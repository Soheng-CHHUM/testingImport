import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  friendsSet: ['data'],
})

export const FriendsTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  data: null
})

/* ------------- Selectors ------------- */

export const FriendsSelectors = {
  getData: state => state.data
}

export const getFriends = FriendsSelectors.getData

/* ------------- Reducers ------------- */

// request the data from an api
export const set = (state, { data }) =>
  state.merge({ data })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.FRIENDS_SET]: set
})

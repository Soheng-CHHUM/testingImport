import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  notificationRemove: ['payload'],
  notificationPush: ['payload'],
  notificationClear: null,
  notificationSetIsPlayingSound: ['isPlayingSound']
})

export const NotificationTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  data: [],
  isPlayingSound: false
})

/* ------------- Selectors ------------- */

export const NotificationSelectors = {
  getData: state => state.data
}

/* ------------- Reducers ------------- */
export const remove = (state, { payload }) => {
  const data = state.data.filter(function(curData) {
    return curData.id != payload.id
  })

  return state.merge({ data })
}

export const push = (state, { payload }) => {

  if(state.data.find((elt) => elt.id == payload.id)) return state

  return state.merge({ data: state.data.concat([payload]) })
}

export const setIsPlaying = (state, { isPlayingSound }) => state.merge({ isPlayingSound })

export const clear = state =>
  state.merge({ data: [] })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.NOTIFICATION_REMOVE]: remove,
  [Types.NOTIFICATION_PUSH]: push,
  [Types.NOTIFICATION_CLEAR]: clear,
  [Types.NOTIFICATION_SET_IS_PLAYING_SOUND]: setIsPlaying,
})

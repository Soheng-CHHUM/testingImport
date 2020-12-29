import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  settingsAppSet: ['appData'],
  settingsUserSet: ['userData']
})

export const SettingsTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  appData: null,
  userData: null
})

/* ------------- Selectors ------------- */

export const SettingsSelectors = {
  getData: state => state.data
}

/* ------------- Reducers ------------- */

export const appSet = (state, { appData }) =>
  state.merge({ appData })

export const userSet = (state, { userData }) =>
  state.merge({ userData })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SETTINGS_APP_SET]: appSet,
  [Types.SETTINGS_USER_SET]: userSet
})

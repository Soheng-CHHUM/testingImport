import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import configureStore from './CreateStore'
import rootSaga from '../Sagas/'
import ReduxPersist from '../Config/ReduxPersist'

/* ------------- Assemble The Reducers ------------- */
export const reducers = combineReducers({
  appState: require('./AppStateRedux').reducer,
  nav: require('./NavigationRedux').reducer,
  github: require('./GithubRedux').reducer,
  user: require('./UserRedux').reducer,
  search: require('./SearchRedux').reducer,
  autoplayedMessages: require('./AutoPlayMessageRedux').reducer,
  auth: require('./AuthRedux').reducer,
  notifications: require('./NotificationRedux').reducer,
  assets: require('./PrepareAssetsRedux').reducer,
  settings: require('./SettingsRedux').reducer,
  friends: require('./FriendsRedux').reducer,
  thread: require('./ThreadRedux').reducer,
  userLocationParking: require('./UserLocationParkingRedux').reducer,
  userAlerts: require('./UserAlertsRedux').reducer,
})

export default () => {
  let finalReducers = reducers
  // If rehydration is on use persistReducer otherwise default combineReducers
  if (ReduxPersist.active) {
    const persistConfig = ReduxPersist.storeConfig
    finalReducers = persistReducer(persistConfig, reducers)
  }

  let { store, sagasManager, sagaMiddleware } = configureStore(finalReducers, rootSaga)

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./').reducers
      store.replaceReducer(nextRootReducer)

      const newYieldedSagas = require('../Sagas').default
      sagasManager.cancel()
      sagasManager.done.then(() => {
        sagasManager = sagaMiddleware.run(newYieldedSagas)
      })
    })
  }

  return store
}

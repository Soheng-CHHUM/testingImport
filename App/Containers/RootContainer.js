import React, { Component } from 'react'
import { View, StatusBar } from 'react-native'
import ReduxNavigation from '../Navigation/ReduxNavigation'
import AppNavigation from '../Navigation/AppNavigation'
import { connect } from 'react-redux'
import AuthActions from '../Redux/AuthRedux'
import FriendsActions from '../Redux/FriendsRedux'
import StartupActions from '../Redux/StartupRedux'
import SettingsActions from '../Redux/SettingsRedux'
import ReduxPersist from '../Config/ReduxPersist'
import NotificationHandler from './NotificationHandler'
import SettingsService from '../Services/Settings'
import UserTracker from '../Services/UserTracker'

import KeepAwake from 'react-native-keep-awake'

// Styles
import styles from './Styles/RootContainerStyles'

class RootContainer extends Component {
  componentDidMount () {
    // if redux persist is not active fire startup action
    if (!ReduxPersist.active) {
      this.props.startup()
    }

    UserTracker.setUser(this.props.user)
    UserTracker.start()

    this.listenUserChanges(this.props.user)
    this.listenSettingsChange(this.props.user)
  }

  componentWillMount() {
    this.listenSettingsChange(this.props.user)
  }

  componentWillUnmount() {
    this.onUserSettingsChanged = false
    this.onAppSettingsChanged = false
    SettingsService.stopListenOnAppSettings()
    SettingsService.stopListenOnUserSettings()
    UserTracker.stop()
  }

  componentWillReceiveProps(props) {
    UserTracker.setUser(props.user)

    this.listenSettingsChange(props.user)
    this.listenUserChanges(props.user)
  }

  listenUserChanges(user) {
    if(!user) return

    UserTracker.onChanged((user) => this.onUserChanged(user))
    UserTracker.onFriendsChanged((friends) => this.onFriendsChanged(friends))
  }

  listenSettingsChange(user) {
    if(user && !this.onUserSettingsChanged) {
      this.onUserSettingsChanged = true
      SettingsService.listenOnUserSettings(user.key, (snap) => {
        this.props.setUserSettings(snap.val())
      })
    }

    if(!this.onAppSettingsChanged) {
      this.onAppSettingsChanged = true
      SettingsService.listenOnAppSettings((snap) => {
        this.props.setAppSettings(snap.val())
      })
    }
  }

  onUserChanged(user) {
    this.props.setUser(user)
    this.props.setNbUnreadMessages(user.nbUnreadMessages);
  }

  onFriendsChanged(friends) {
    this.props.setUserFriends(friends)
  }

  render () {
    return (
      <View style={styles.applicationView}>
        <KeepAwake />
        <StatusBar barStyle='light-content' />
        <NotificationHandler />
        <AppNavigation />
      </View>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
}

// wraps dispatch to create nicer functions to call within our component
const mapDispatchToProps = (dispatch) => ({
  startup: () => dispatch(StartupActions.startup()),
  setAppSettings: (settings) => dispatch(SettingsActions.settingsAppSet(settings)),
  setUserSettings: (settings) => dispatch(SettingsActions.settingsUserSet(settings)),
  setNbUnreadMessages: (nbUnreadMessages) => dispatch(AuthActions.authSetNbUnreadMessages(nbUnreadMessages)),
  setUser: (user) => dispatch(AuthActions.authSetUser(user)),
  setUserFriends: (friends) => dispatch(FriendsActions.friendsSet(friends)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)

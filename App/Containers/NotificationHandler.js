import React, { Component } from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'
import UserService from '../Services/User'
import FirebaseService from '../Services/Firebase'
import AuthActions from '../Redux/AuthRedux'
import NotificationActions from '../Redux/NotificationRedux'
import PrepareAssetsActions from '../Redux/PrepareAssetsRedux'

import RNFS from 'react-native-fs'

var Sound = require('react-native-sound');

class NotificationHandler extends Component {
  constructor(props){
    super(props);
    this.state = {
      fcmToken: null
    };
    global.currentScene = "NotificationHandler"
  }

  componentDidMount () {

    this.checkPermission();

    FirebaseService.messaging().getToken()
      .then(fcmToken => this.receiveFcmToken(fcmToken));

    this.props.prepareAssets()

    this.onNotification = FirebaseService.notifications().onNotification(notification => {
      switch(notification._data.type) {
        case 'alert-pv':
          this.playSound('alert.wav')
        break;
        case 'pv-zone':
          this.playSound('alert_pv.wav')
        break;
        case 'danger-zone':
          this.playSound('alert_zone.wav')
        break;
      }

      this.props.pushNotification({
        id: notification._notificationId,
        title: notification.title,
        subtitle: notification._subtitle,
        body: notification._body,
        data: notification._data,
      })
    });

    this.onTokenRefreshListener = FirebaseService.messaging().onTokenRefresh(fcmToken => {
        if(this.fcmToken != fcmToken) this.receiveFcmToken(fcmToken);
    });
  }

  componentWillUnmount() {
    if(this.dbRef) this.dbRef.off('value')

    this.isListeningUser = false
  }

  componentWillReceiveProps(props) {
    if(!props.user) return

    if(this.fcmToken) this.storeFcmToken(this.fcmToken, props.user)

    if(this.isListeningUser) return

    this.isListeningUser = true

    /*this.dbRef = FirebaseService.database().ref('/users/' + props.user.key)

    this.dbRef.on('value', (snapshot) => {

      if(!snapshot.exists() || snapshot.val() == null) return;

      let nbUnreadMessages = snapshot.val().nbUnreadMessages;

      if(nbUnreadMessages && nbUnreadMessages > 0) FirebaseService.notifications().setBadge(nbUnreadMessages);
      else FirebaseService.notifications().setBadge(0);

      this.props.setUser({
        ...snapshot.val(),
        key: snapshot.key,
        Key: snapshot.key
      })

      this.props.setNbUnreadMessages(nbUnreadMessages);
    });*/
  }

  playSound(filename) {

    let track = new Sound(`${RNFS.DocumentDirectoryPath}/sounds/${filename}`, null, (error) => {
      if (error) return

      this.props.setIsPlayingSound(true)

      track.setVolume(1)

      track.play(() => {
        this.props.setIsPlayingSound(false)
      })
    });
  }

  async checkPermission() {
    const hasPermission = await FirebaseService.messaging().hasPermission();

    if(!hasPermission) {

        try {
            await FirebaseService.messaging().requestPermission();
            // User has authorised
        } catch (error) {
            // User has rejected permissions
        }
    }
  }

  receiveFcmToken(token) {

    if(!token) return;

    this.fcmToken = token;

    if(!this.props.user) return;

    this.storeFcmToken(this.fcmToken, this.props.user);
  }

  storeFcmToken(token, user) {

    if(!user || token == this.state.fcmToken) return;

    this.setState({fcmToken: token}, () => {
      FirebaseService.database().ref('users/' + user.Key)
        .update({fcmToken: token});

      UserService.updateDevice(user, {fcmToken: token, userID: user.Key});
    })
  }

  render () {
    return <View></View>;
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    nbUnreadMessages: state.auth.nbUnreadMessages,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    pushNotification: (notification) => dispatch(NotificationActions.notificationPush(notification)),
    //setNbUnreadMessages: (nbUnreadMessages) => dispatch(AuthActions.authSetNbUnreadMessages(nbUnreadMessages)),
    prepareAssets: () => dispatch(PrepareAssetsActions.prepareAssetsRequest()),
    setIsPlayingSound: (isPlaying) => dispatch(NotificationActions.notificationSetIsPlayingSound(isPlaying)),
    //setUser: (user) => dispatch(AuthActions.authSetUser(user)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationHandler)

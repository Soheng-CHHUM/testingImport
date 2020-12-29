import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { View, Text, FlatList, AppState, TouchableOpacity, Image, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import { SkypeIndicator } from 'react-native-indicators'

import styles from './Styles/MessageListStyle'

import FirebaseService, { handleError } from '../Services/Firebase'

import AppConfig from '../Config/AppConfig'
import Distance from '../Services/Distance'
import UserService from '../Services/User'
import Message from './Message'

import AutoPlayMessageActions from '../Redux/AutoPlayMessageRedux'

import { ALL, PRIVATE, CHAT } from '../Services/Enums/ChatTypes'
import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog';
// import NotificationList from './NotificationList'
import { Images, Colors } from '../Themes'
import GeoService, { MESSAGES } from '../Services/GeoService'
const databaseRef = FirebaseService.database()

class MessageList extends Component {
  // // Prop type warnings
  static propTypes = {
    recordsSource: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    currentLocation: PropTypes.object,
    isRecording: PropTypes.bool,
    isAutoplayActivated: PropTypes.bool,
    onPlayRecord: PropTypes.func,
    onStopRecord: PropTypes.func,
    onProfileShow: PropTypes.func
  }
  //
  // // Defaults for props
  static defaultProps = {
    onPlayRecord: () => { },
    onStopRecord: () => { },
    onProfileShow: () => { },
    isRecording: false,
    isAutoplayActivated: true
  }

  constructor(props) {
    super(props);
    this.state = {
      recordAudioList: this.makeRecordAudioList([], false),
      selectedProfilItem: '',
      radioChannelData: '',
      isAutoPlay: true,
      lastRecordPlayed: null,
      radioSelectedPlay: false,
      loaded: false,
      refreshing: true,
      islimitedCount: this.getLimitRecordToPlay(),
      isPlaying: false,
      playingIndex: null,
      autoplayedMessages: props.autoplayedMessages ? props.autoplayedMessages : [],
      messageAnimationDialog: false,
      // notification: false,
      userSettings: props.userSettings
    }

    this.onaudioList = this.onaudioList.bind(this);
    this.onradioSelected = this.onradioSelected.bind(this);
    this.onProfileShow = this.onProfileShow.bind(this);
    this.playRecord = this.playRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.autoPlayedMessages = {};

    this.onSettingsChangeListener = FirebaseService.database
  }

  componentWillMount() {
    this.onaudioList(this.props.recordsSource);
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    if (this.props.recordsSource) {
      UserService.reloadThread(this.props.user, this.props.recordsSource)

      if(this.props.recordsSource == ALL) this.listenMessagesAroundMe()

      if(this.props.currentLocation) GeoService.setLocationWithoutRecording(MESSAGES, this.props.currentLocation)
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    if(this.dbRef) this.dbRef.off('value')
    GeoService.stopListen(MESSAGES)
    this.isListeningMessages = false
  }

  componentWillReceiveProps(nextProps) {

    const isChatChanged = this.state.recordsSource !== nextProps.recordsSource;
    const isAutoPlayChanged = nextProps.isAutoplayActivated !== this.props.isAutoplayActivated;
    const shouldAutoPlayLastRecord = nextProps.isNewaudioAutoPlay && !this.state.isPlaying;
    const isUserChanged = UserService.hasPropertyChanged(this.props.user, nextProps.user);
    const isSourceChanged = this.props.recordsSource != nextProps.recordsSource;
    const isAutoplayedMessagesChanged = nextProps.autoplayedMessages && nextProps.autoplayedMessages.length != this.state.autoplayedMessages.length;
    const isLocationChanged = this.props.currentLocation != nextProps.currentLocation

    if (nextProps.userSettings != this.props.userSettings) {
      this.setState({ userSettings: nextProps.userSettings })
    }

    if(isLocationChanged && nextProps.currentLocation) {
      GeoService.setLocationWithoutRecording(MESSAGES, nextProps.currentLocation)
    }

    if (isChatChanged || isUserChanged || isSourceChanged) {
      this.setState({ recordsSource: nextProps.recordsSource }, () => {
        this.onaudioList(nextProps.recordsSource);
      })
    }
    else if (isAutoPlayChanged || this.state.recordAudioList.data.length == 0) {
      if (shouldAutoPlayLastRecord && this.state.recordAudioList.data.length > 0) {
        this.playLastRecord();
      } else {
        this.setState({ isAutoPlay: nextProps.isAutoplayActivated, islimitedCount: this.getLimitRecordToPlay() });
      }
    } else if (isAutoplayedMessagesChanged) {
      this.setState({ autoplayedMessages: nextProps.autoplayedMessages });
    }
  }

  reload(recordsSource) {
    this.onaudioList(recordsSource);
  }

  getLimitRecordToPlay = () => {
    return 1;
  }

  makeRecordAudioList = (data, source) => {
    return {
      source,
      data: _.uniqBy(data, 'audio.key')
    };
  }

  playRecord = (index) => {
    this.onPlayChanged(index, true);
  }

  stopRecord = (key) => {
    this.onPlayChanged(key, false);
  }

  onPlayChanged = (key, isPlaying) => {
    let playingIndex = this.state.playingIndex;

    if (isPlaying) playingIndex = key;
    else if (playingIndex == key) playingIndex = null;

    if (isPlaying) this.props.onPlayRecord();
    else this.props.onStopRecord();

    this.setState({
      lastRecordPlayed: isPlaying ? playingIndex : this.state.lastRecordPlayed,
      isPlaying: this.state.loaded ? isPlaying : false,
      playingIndex
    });
  }

  playLastRecord = () => {

    let trackID = this.state.recordAudioList.data && this.state.recordAudioList.data.length ? this.state.recordAudioList.data[0].audio.Key : null;

    if (this._flatList) this._flatList.scrollToOffset({ animated: true, offset: 0 });

    if (trackID == null) return;

    if (this.state.autoplayedMessages.includes(trackID)) return;

    this.setState({
      isAutoPlay: true,
      isPlaying: false,
      lastRecordPlayed: null,
      playingIndex: trackID,
      radio_selected_index: 0,
      radioSelectedPlay: true,
      islimitedCount: this.getLimitRecordToPlay(),
    });

    this.props.addAutoPlayedMessage(trackID);
  }

  onradioSelected = (index, isradioPlay, isClicked) => {
    this.setState({
      radio_selected_index: index,
      radioSelectedPlay: isradioPlay,
      islimitedCount: isradioPlay && isClicked ? this.getLimitRecordToPlay() : this.state.islimitedCount
    });
  }

  onProfileShow = (flag, item) => {     // profile modal dialog show
    this.props.onProfileShow(item.user);
  }

  onProfilCancel = () => {    // Handle to cancel profile on Modal dialog
    this.setState({ profilVisible: false });
  }

  refreshList = (user) => {

    let data = this.state.recordAudioList.data.map((audio) => {

      if (audio.user.Id != user.id) return audio;

      return {
        ...audio,
        user
      }
    });

    this.setState({ recordAudioList: this.makeRecordAudioList(data, this.state.recordsSource) });
  }

  onaudioList = (recordsSource) => {
    audioList = [];

    this.setState({
      recordAudioList: this.makeRecordAudioList([], recordsSource), islimitedCount: this.getLimitRecordToPlay(), recordsSource
    }, () => {
      this.fetchAudios(recordsSource);
    });

  }

  fetchAudios = (recordsSource) => {

    if(!recordsSource) return

    if(!this.state.refreshing) this.setState({refreshing: true})

    this.dbRef = databaseRef.ref('/messages/' + recordsSource)
                            .orderByChild('createdAt')
                            .limitToFirst(40)

    if(this.isListeningMessages) {
      this.dbRef.off('value')
      this.dbRef.off('child_removed')
      GeoService.stopListen(MESSAGES)
    }

    if(recordsSource == ALL) {
      return this.setState({refreshing: false}, () => this.listenMessagesAroundMe())
    }

    this.isListeningMessages = true

    this.dbRef.on('value', (snapshot) => {  // audio search

        if (recordsSource != this.state.recordsSource) return;

        this.getAudiosFromSnapshot(snapshot, (audios) => {
          
          this.setState({
            refreshing: false,
            recordAudioList: this.makeRecordAudioList(audios, this.props.recordsSource), islimitedCount: this.getLimitRecordToPlay()
          }, () => {
            if (this.props.shouldPlayLastRecord) {
              this.playLastRecord();
            }
          });
        });

      }, (error) => this.setState({refreshing: false }) && handleError(error));
  }

  listenMessagesAroundMe = () => {

    this.setState({
      recordAudioList: this.makeRecordAudioList([], this.props.recordsSource), islimitedCount: this.getLimitRecordToPlay()
    })

    GeoService.listenMessages(this.props.recordsSource, (key) => {
      queries = []
      messages = []

      queries.push(this.getMessage(key, (message) => {
        if(message) messages.push(message)
      }))

      return Promise.all(queries).then(() => {
        let stateMessages = this.state.recordAudioList.data ? this.state.recordAudioList.data.filter(message => {
          return messages.find(message2 => message2.audio.key == message.audio.key) == null
        }) : []

        messages = messages.concat(stateMessages)

        this.setState({
          refreshing: false,
          recordAudioList: this.makeRecordAudioList(this.sortMessages(messages), this.props.recordsSource), islimitedCount: this.getLimitRecordToPlay()
        }, () => {
          if (this.props.shouldPlayLastRecord) {
            this.playLastRecord();
          }
        });
      })
    }, key => {
      let audios = this.state.recordAudioList.data.filter((data) => {
        return data.audio && data.audio.key != key
      })

      this.setState({
        recordAudioList: this.makeRecordAudioList(audios, this.props.recordsSource), islimitedCount: this.getLimitRecordToPlay()
      })
    })

    if(this.props.currentLocation) GeoService.setLocationWithoutRecording(MESSAGES, this.props.currentLocation)

    if(!this.dbRef) return

    this.dbRef.on('child_removed', snapshot => {

      let audios = this.state.recordAudioList.data.filter((data) => {
        return data.audio && data.audio.key != snapshot.key
      })

      this.setState({
        recordAudioList: this.makeRecordAudioList(audios, this.props.recordsSource), islimitedCount: this.getLimitRecordToPlay()
      })
    })
  }

  async getMessage(key, callback) {

    const snap = await FirebaseService.database().ref('/messages/' + this.props.recordsSource)
        .child(key)
        .once('value')

    if(!snap.exists()) return callback()

    const isBlocked = await UserService.isUserBlocked(this.props.user.key, snap.val().userID)

    if(isBlocked) return callback()

    const userSnap = await FirebaseService.database()
                          .ref('/users')
                          .child(snap.val().userID)
                          .once('value')

    if(!userSnap.val()) return callback()
    if(!snap.val()) return callback()

    return callback({
      audio: {...snap.val(), key: snap.key, Key: snap.key},
      user: {...userSnap.val(), key: userSnap.key}
    })
  }

  sortMessages(messages) {

    return messages.sort((messageA, messageB) => {

      if(messageA.audio.createdAt == null) return -1;
      if(messageB.audio.createdAt == null) return 1;

      if(messageB.audio.createdAt < messageA.audio.createdAt) return -1;

      return 1;
    })
  }
  
  getAudiosFromSnapshot = (snapshot, callback) => {

    var users = { data: [] };
    var audios = [];
    var requests = [];
    var audiosKeys = {}

    snapshot.forEach((childSnapshot) => {
      let audioData = childSnapshot.val();

      if(!audioData || audiosKeys[childSnapshot.key]) return

      audiosKeys[childSnapshot.key] = true

      audioData.key = childSnapshot.key;
      audioData.Key = childSnapshot.key;
      audioData.isPlay = false;
      if (!users[audioData.userID]) {
        requests.push(this.getUserRequestFromAudio(audioData, (user) => {
          if (user) users.data.push(user);
        }));

        users[audioData.userID] = true;
      }
      audios.push(audioData);
    });

    Promise.all(requests).then(() => {
      if (this.props.user) {
        UserService.filterUserBlocked(this.props.user.Key, users.data, (users) => {
          audios = audios.map((audio) => {
            return {
              audio, ...{
                user: users.find((user) => user.key == audio.userID)
              }
            }
          }).filter((audio) => {
            return audio.user;
          });

          audios = audios.reverse();

          return callback(audios);
        })
      }

    }).catch((error) => {

    });
  }

  getUserRequestFromAudio = (audio, callback) => {

    return databaseRef.ref('users/' + audio.userID).once('value').then(snapshot => {
      if (!snapshot.val()) return callback(null);

      let user = {
        ...snapshot.val(),
        key: snapshot.key,
        Key: snapshot.key
      };

      callback(user);
    });
  }

  getCurrentLocation = () => {
    if (this.props.currentLocation) return this.props.currentLocation;

    return this.props.curPosition;
  }

  getNearbyAudioList = () => {

    const nbKmLimit = this.props.user.nbKmLimitZone ? this.props.user.nbKmLimitZone : AppConfig.nbKmLimitZone

    let filer_audioList = audioList.filter((object) => {
      let distance = this.getDistanceFromLatLonInKm(object.audio);

      if (distance == null || !distance) return true

      return distance < nbKmLimit
    });

    return this.makeRecordAudioList(filer_audioList, true);
  }

  getDistanceFromLatLonInKm = (item) => {    // calculate distance(Km)
    return Distance.calculate(
      this.getCurrentLocation().latitude,
      this.getCurrentLocation().longitude,
      item.Lat,
      item.Lon
    );
  }

  handleAppStateChange = (nextAppState) => {
    if (nextAppState == 'active') UserService.reloadThread(this.props.user, this.state.recordsSource);
  }

  // openNotification = () => {
  //   this.setState({
  //     notification: !this.state.notification
  //   });
  // }

  render() {
    const { isAutoPlay, radioSelectedPlay, recordAudioList,
      islimitedCount, isPlaying, playingIndex, lastRecordPlayed, userSettings } = this.state;
      
    return (
      <View style={styles.container}>

        {/* {
          this.state.recordsSource == ALL && <NotificationList />
        } */}

        {
          this.state.refreshing ?
            <View style={styles.containerSearchIcon}>
              <SkypeIndicator color={Colors.mainColor} size={26} style={{ alignSelf: 'center' }} />
            </View>
          : null
        }

        <FlatList
          ref={(ref) => this._flatList = ref}
          style={styles.messageList}
          data={recordAudioList.data}
          refreshing={this.state.refreshing}
          keyExtractor={(item, index) => index.toString() + '_' + this.state.recordsSource}
          ListFooterComponent={() => <View style={{ height: 120}} />}
          ListHeaderComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item, index }) => (
            <TouchableOpacity key={'TouchableOpacity_' + item.audio ? item.audio.key : index} onPress={() => {
              this.setState({
                messageAnimationDialog: true,
              });
            }}>
              <Message
                item={item}
                index={index}
                key={item.audio ? item.audio.key : index}
                user={this.props.user}
                lastRecordPlayed={lastRecordPlayed}
                selected_index={playingIndex}
                selected_play={radioSelectedPlay}
                onRadioSelected={this.onradioSelected}
                onProfileShow={this.onProfileShow}
                onPlayRecord={this.playRecord}
                onStopRecord={this.stopRecord}
                isPlayingOutsideSound={this.props.isPlayingOutsideSound}
                isPlaying={item.audio && playingIndex == item.audio.key && isPlaying}
                isAutoPlay={isAutoPlay}
                isRecording={this.props.isRecording}
                islimitedCount={islimitedCount}
                forceSpeaker={userSettings ? !userSettings.bluetooth : false}
              />
            </TouchableOpacity>
          )}
        ></FlatList>

      </View>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    autoplayedMessages: state.autoplayedMessages.data,
    userSettings: state.settings.userData,
    isPlayingOutsideSound: state.notifications.isPlayingSound
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addAutoPlayedMessage: (msg) => dispatch(AutoPlayMessageActions.autoPlayMessageAdd(msg)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageList)

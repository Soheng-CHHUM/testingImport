import React, { Component } from 'react'
import PropTypes from 'prop-types';

import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native'
import styles from './Styles/MessageStyle'
import Slider from "react-native-slider"
import UserService from '../Services/User'
import { Colors, Images } from '../Themes'

//import fonts from '../../../styles/fontStyle';
//import styles from '../mainbebeepStyle';
//import Images from '../../../themes/Images';

import UserPicture from './UserPicture'
import { SkypeIndicator } from 'react-native-indicators'
import RNFetchBlob from 'rn-fetch-blob'
import TimeService from '../Services/Timer'
import * as Progress from 'react-native-progress';
import Time from '../Services/Time'

var Sound = require('../Modules/react-native-sound');


export default class Message extends Component {
  // // Prop type warnings
  static propTypes = {
    item: PropTypes.object,
    user: PropTypes.object.isRequired,
    index: PropTypes.number,
    onPlayRecord: PropTypes.func,
    onStopRecord: PropTypes.func,
    onRadioSelected: PropTypes.func,
    onProfileShow: PropTypes.func,
    lastRecordPlayed: PropTypes.object,
    isAutoPlay: PropTypes.bool,
    forceSpeaker: PropTypes.bool,
    isPlaying: PropTypes.bool
  }

  static defaultProps = {
    onPlayRecord: () => { },
    onStopRecord: () => { },
    onRadioSelected: () => { },
    onProfileShow: () => { },

    isPlaying: false,
    isRecording: false,
    isAutoPlay: true
  }

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      track: null,
      isMessageHeard: false,
      item: {
        user: props.item && props.item.user ? props.item.user : {},
        audio: props.item && props.item.audio ? props.item.audio : {}
      },
      username: props.item && props.item.user ? props.item.user.Name : null,
      avatar: props.item && props.item.user ? props.item.user.Avatar : null,
      status: props.item && props.item.user ? props.item.user.status : null,
      index: props.index,
      isPlaying: false,
      shouldPlay: false,
      forceSpeaker: props.forceSpeaker,
      loaded: false,
      pass_time: 0,
      isPlayClickable: true,
      max_time: 0,
    }

    this.devices = {};
    this.nbBleDevices = 0;
  }

  componentWillMount() {

    this._isMounted = true;

    if (!this.props.item.audio.url || this.props.item.audio.url.trim() == '') return

    RNFetchBlob
      .config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
      })
      .fetch('GET', this.props.item.audio.url, {
      })
      .then((res) => {
        var filePath = res.path();

        if (!this._isMounted) return

        let track = new Sound(filePath, null, (error) => {

          track.setVolume(1);
          this.setState({ loaded: true });

          if (error) {
            return;
          }
          else {
            if (!this.state.shouldPlay && (this.state.isPlaying || !this.props.isAutoPlay)) return;

            const key = this.props.item.audio.Key;

            if (!this.state.shouldPlay && (this.props.lastRecordPlayed == key || key != this.props.selected_index)) return;

            this.playRecord(key, this.props.index);

            // this.setState({isfileload: true});
          }
        });

        this.setState({ track: track });
      })
      .catch((err) => {
        this.setState({ loaded: true })
      })
  }

  componentWillUnmount() {
    this._isMounted = false
    if (this._interval) clearInterval(this._interval);
  }

  componentWillReceiveProps(nextProps) {
    let { index, selected_index, isAutoPlay, item } = nextProps;

    const key = item.audio.Key;

    let nextState = {};

    const changes = {
      playedChanged: nextProps.isPlaying && !this.state.isPlayClickable,
      keyChanged: nextProps.item.Key != this.state.item.Key,
      avatarChanged: nextProps.item.user.Avatar != this.state.avatar,
      statusChanged: nextProps.item.user.status != this.state.status,
      usernameChanged: nextProps.item.user.Name != this.state.username,
      shouldStop: this.state.isPlaying && (nextProps.isRecording || nextProps.isPlayingOutsideSound || ((key != selected_index) && selected_index != null)),
      indexChanged: this.state.index != index,
      // forceSpeakerChanged: nextProps.forceSpeaker != this.state.forceSpeaker
    };
    
    if (changes.indexChanged) changes.index = index;

    if (changes.playedChanged) nextState.isPlayClickable = true; //this.setState({isPlayClickable: true});

    if (changes.keyChanged) nextState.item = nextProps.item.Key; //this.setState({item: nextProps.item.Key});

    if (changes.avatarChanged) nextState.avatar = nextProps.item.user.Avatar; // this.setState({avatar: nextProps.item.user.Avatar});

    if (changes.usernameChanged) nextState.username = nextProps.item.user.Name; //this.setState({username: nextProps.item.user.Name});

    if (changes.shouldStop) nextState.shouldPlay = false;

    if (changes.statusChanged) nextState.status = nextProps.item.user.status;

    if (changes.shouldStop) {

      nextState.isPlayClickable = true;
      nextState.isPlaying = false;

      this.setState(nextState);

      this.stopRecord(key, nextProps);

      clearInterval(this._interval);

      return;
    }

    // if (this.state.track) this.state.track.forceOutputOnSpeaker(nextProps.forceSpeaker)

    let shouldUpdateState = false;

    for (var i in changes) {
      if (changes[i]) shouldUpdateState = true;
    }

    if (shouldUpdateState) this.setState(nextState);

    if (!isAutoPlay || !this.state.loaded || nextProps.lastRecordPlayed == key || key != selected_index) return;

    this.playRecord(key, index);
  }

  playRecord = (key, index) => {

    clearInterval(this._interval);
    this.props.onPlayRecord(key);

    this.setState({ isPlaying: true, shouldPlay: false, isPlayClickable: false }, () => {
      this.startPlayRecord(key, index);
    });
  }

  startPlayRecord = (key, index) => {

    if (!this.state.track) return;

    if (this.state.pass_time) {
      this.state.track.setCurrentTime(this.state.pass_time);
    }

    this._interval = setInterval(() => {

      if (!this._isMounted) return

      this.state.track.getCurrentTime((seconds) => {
        let duration = this.state.track.getDuration();
        let pass_time = this.state.pass_time;
        if (seconds <= duration) {
          pass_time = seconds;
        }

        if ((seconds + 0.5) >= duration) {
          pass_time = duration;

          clearInterval(this._interval);
        }

        let progress = pass_time / duration

        this.setState({ pass_time: pass_time, isPlayClickable: true, progress });
      });

    }, 500);

    setTimeout(() => {
      this.playTrack(key, index);
    }, 500);
  }

  isMessageUnHeard = () => {
    if (!this.props.item || !this.props.item.audio | !this.props.user) return true

    return !this.state.isMessageHeard &&
      this.props.item.audio &&
      (!this.props.item.audio.heardBy || !this.props.item.audio.heardBy[this.props.user.key])
  }

  playTrack = (key, index) => {

    if (!this.state.track) return;

    this.setSoundCategoryPlayRecord();

    if (this.isMessageUnHeard()) {
      UserService.listenMessage(this.props.user.key, this.props.item.audio.recordChannel, this.props.item.audio.key)
    }

    this.state.track.play((success, error) => {
      let pass_time = this.state.pass_time;

      if (success) {
        this.props.onRadioSelected(index, false, false);
        this.props.onStopRecord(key);
        pass_time = 0;
      } else {
        if (!this.state.loaded) {
          this.setState({ shouldPlay: true });
        }
        else {
          this.props.onStopRecord(key);

          pass_time = 0;
        }
      }

      this.setState({ pass_time, progress: 0, isPlaying: false, isMessageHeard: true, isPlayClickable: true });
      this.state.track.setCurrentTime(0);
      this.setSoundCategoryRecordAudio();
      clearInterval(this._interval);
    });
  }

  stopRecord = (key, props) => {

    clearInterval(this._interval);
    if (this.state.track) {
      this.state.track.pause();
    }

    this.setSoundCategoryRecordAudio();

    this.setState({ isPlaying: false, isPlayClickable: true });
    this.props.onStopRecord(key);
  }

  setSoundCategoryPlayRecord = () => {

    soundCategory = 'Playback';

    if (Platform.OS == 'ios') Sound.setCategory('PlayAndRecord');
    else Sound.setCategory('Playback');

    //Sound.setActive(true);

    if (!this.state.track) return;

    this.state.track.setVolume(1);
  }

  setSoundCategoryRecordAudio = () => {
    soundCategory = 'Record';
    Sound.setCategory('PlayAndRecord', true);
    //Sound.setActive(false);
  }

  onAvatar = (item) => {
    this.props.onProfileShow(true, item);
  }

  onvalueChanged = (value) => {
    if (this.state.track) this.state.track.setCurrentTime(value);
    this.setState({ pass_time: value });
  }

  onPlayClicked = (key) => {

    if (this.state.isPlayClickable == false || this.state.isPlaying) return;

    this.setState({ isPlayClickable: false }, () => {
      this.playRecord(key, this.state.index);
    });
    //this.props.onRadioSelected(index, !isPlay, true);
  }

  onStopClicked = (key) => {

    if (this.state.isPlayClickable == false || !this.state.isPlaying) return;

    this.setState({ isPlayClickable: false }, () => {
      this.stopRecord(key, this.props);
    });
  }

  getCreatedTime(timestamp) {
    return Time.formatMessage(timestamp)
  }

  shouldComponentUpdate(nextProps, nextState) {

    const shouldUpdate = this.state.pass_time != nextState.pass_time ||
      this.state.isradioPlay != nextState.isradioPlay ||
      this.state.avatar != nextState.avatar ||
      this.state.status != nextState.status ||
      this.state.username != nextState.username ||
      this.state.isMessageHeard != nextState.isMessageHeard ||
      this.state.isPlayClickable != nextState.isPlayClickable ||
      this.props.isPlaying != nextProps.isPlaying ||
      this.state.isPlaying != nextState.isPlaying ||
      this.props.item.Key != nextProps.item.Key ||
      this.props.isAutoPlay != nextProps.isAutoPlay ||
      this.props.isPlayingOutsideSound != nextProps.isPlayingOutsideSound;

    return shouldUpdate;
  }

  render() {
    const { item } = this.props;
    let audio_duration = item.audio.duration;
    const { track, isPlayClickable } = this.state;
    const pass_time = this.state.pass_time;
    const img_radio_play = Images.play;
    const img_radio_stop = Images.stop;
    const messageSenderId=this.props.item.audio.userID
    const currentUserId=this.props.user.key

    const user = this.props.item && this.props.item.user ? this.props.item.user : {}
    if (track) {
      if (track.getDuration() > 0) audio_duration = track.getDuration();
    }

    return <TouchableOpacity style={styles.container} onPress={() => this.props.onPress ? this.props.onPress() : null}>
      <UserPicture
        onPress={() => this.onAvatar(item)}
        user={{
          ...user,
          Avatar: this.state.avatar,
          status: this.state.status
        }}
      />
      <View style={styles.messageInfoContainer}>
        <Text style={styles.textBigInfo}>{this.state.username}</Text>
        <Text style={styles.textMediumInfo}>{this.getCreatedTime(item.audio.createdAt)}</Text>
      </View>
      <View>
        <Text style={[styles.textSmallInfo, { paddingRight:5,color: this.state.isPlaying ? Colors.mainColor : Colors.black }]}>{audio_duration ? TimeService.formatTimeToHHMMSS(audio_duration) : null}</Text>
      </View>
      <View style={styles.buttonsInner}>
        {
          isPlayClickable ?
            (
              this.state.isPlaying ?
                <TouchableOpacity
                  onPress={() => this.onStopClicked(item.audio.Key)}>
                  <View style={styles.progressContainer}>
                    <Progress.Circle
                      progress={this.state.progress}
                      color={styles.progress.color}
                      borderWidth={0}
                      thickness={styles.progress.width}
                      showsText={false}
                      size={this.props.width} />
                  </View>
                  <View style={styles.buttonContainer}>
                    <View style={styles.buttonStopContainer}>
                      <Image
                        key={'Image_' + this.state.item.audio.key}
                        style={styles.buttonStop}
                        resizeMode='stretch'
                        source={img_radio_stop}
                      />
                    </View>
                  </View>

                </TouchableOpacity>
                :
                <TouchableOpacity
                  onPress={() => this.onPlayClicked(item.audio.Key)}>
                  <View style={styles.progressContainer}>
                    <Progress.Circle
                      progress={100}
                      color={Colors.gray}
                      borderWidth={0}
                      thickness={styles.progress.width}
                      showsText={false}
                      size={this.props.width} />
                  </View>
                  <View style={styles.buttonContainer}>
                  <View style={[styles.buttonPlayContainer, { backgroundColor: this.isMessageUnHeard() ?messageSenderId==currentUserId?Colors.black:Colors.mainColor : Colors.black }]}>
                      <Image
                        key={'Image_' + this.state.item.audio.key}
                        style={styles.buttonPlay}
                        resizeMode='stretch'
                        source={img_radio_play}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
            )
            :
            <SkypeIndicator
              key={'SkypeIndicator_' + this.state.item.audio.key}
              color={Colors.mainColor} size={28} />
        }
      </View>
    </TouchableOpacity>
  }
}

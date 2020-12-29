import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Image, Platform, Modal } from 'react-native'
import styles from './Styles/RecordButtonStyle'
//import Modal from 'react-native-modal'
import { AudioRecorder, AudioUtils } from 'react-native-audio'
import LinearGradient from 'react-native-linear-gradient'
import { BallIndicator } from 'react-native-indicators'
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, Images } from '../Themes'
import AppConfig from '../Config/AppConfig'
import Metrics from '../Themes/Metrics'
import AudioUploader from '../Services/AudioUploader'
import FirebaseService from '../Services/Firebase'
import TimerService from '../Services/Timer'
import Translator from '../Translations/Translator'
import { ALL } from '../Services/Enums/ChatTypes'
import GeoService from '../Services/GeoService';

const databaseRef = FirebaseService.database();

export default class RecordButton extends Component {

  // // Prop type warnings
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    isRecordDeviceFree: PropTypes.bool,
    onStartRecord: PropTypes.func,
    onStopRecord: PropTypes.func,
    recordsSource: PropTypes.string,
    currentLocation: PropTypes.object,
    user: PropTypes.object.isRequired
  }

  static defaultProps = {
    isRecordDeviceFree: true,
    onStartRecord: () => {},
    onStopRecord: () => {},
    height: Metrics.buttons.medium,
    width: Metrics.buttons.medium
  }

  constructor(props){
    super(props);
    this.state = {
      isRecording: false,
      isUploading: false,
      loaded: false,
      recordingTime: 0,
      currentTime: 0.0,
      progress: 0,
      limitedRecordTime: AppConfig.recordTimeLimitSec,
      hasPermission: false,
      isRecordDeviceFree: props.isRecordDeviceFree,
      isFavor: false,
      isnewAudioplay: true,
      audioPath: AudioUtils.DocumentDirectoryPath + '/radio.aac',
    }
  }

  componentDidMount() {
    AudioRecorder.requestAuthorization().then((isAuthorized) => {
      this.setState({ hasPermission: isAuthorized });
      if (!isAuthorized) return;
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isRecordDeviceFree &&
      nextProps.onStopRecord &&
      !this.state.isRecording) {
      nextProps.onStopRecord();
    }
  }

  initRecordDevice() {

    try {
      this.prepareRecordingPath(this.state.audioPath);
    } catch (error) {
      console.error('error prepare recording path', error)
      return;
    }

    AudioRecorder.onProgress = (data) => {
      let currentTime = Math.floor(data.currentTime)
      
      this.setState({currentTime, progress: currentTime / this.state.limitedRecordTime });
    };

    AudioRecorder.onFinished = (data) => {
      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        this.setState({ finished: data.status === "OK" });
      }
    };
  }

  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 44100,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
  }

  async _record() {

    if (this.state.isRecording) {
      console.warn('Already recording!');
      return;
    }

    if (!this.state.hasPermission) {
      return this.onStartRecordFail('Can\'t record, no permission granted!');
    }

    try {
      this.prepareRecordingPath(this.state.audioPath);
    } catch (e) {
      return this.onStartRecordFail('Record device not available', e);
    }

    this.setState({ currentTime: 0, progress: 0, isRecording: true });

    try {
      this.onAudioRecordTimerStart();
    } catch (e) {
      return this.onStartRecordFail('Record device not available, wait a moment', e);
    }

    try {
      await AudioRecorder.startRecording();
    } catch (error) {
      console.error('record==', error);
    }
  }
  async stopAndSave() {

    const audio_duration = this.state.currentTime;
    
    this.setState({isUploading: true}, () => {
      this._stop((filePath) => {

        const {recordsSource} = this.props
  
        var audioData = {
          userID: null,
          url: null,
          duration: null,
          Lat: null,
          Lon: null,
          recordChannel: recordsSource,
          //createdAt: new Date().getTime()
        };
  
        if (audio_duration > 1.0 && this.props.user) {
  
          AudioUploader.uploadAudio(this.state.audioPath) 
            .then(({url, filename}) => {
  
              audioData.userID = this.props.user.Key;
              audioData.url = url;
              audioData.duration = audio_duration;
              audioData.filename = filename
  
              if (this.props.currentLocation) {
                audioData.Lat = this.props.currentLocation.latitude;
                audioData.Lon = this.props.currentLocation.longitude;
              }
  
              this.setState({ isUploading: false });
  
              let messagesRef = databaseRef.ref()
                .child('/messages/' + recordsSource);
              
              let audioKey = messagesRef.push(audioData).key;
              
              if(this.props.currentLocation) {
                let location = GeoService.locationToArray(this.props.currentLocation)
                GeoService.recordLocation(`messages/${recordsSource}`, audioKey, location, (response) => 
                { 
                })
              }
              
              this.onSaveRecordSuccess({
                ...audioData,
                ...{ key: audioKey }
              });
            })
            .catch((error) => this.onSaveRecordFail(error));
        } else {
          this.setState({ isUploading: false });
        }
      })
    })
  }

  async _stop(callback) {

    if (!this.state.isRecording) {
      console.warn('Can\'t stop, not recording!');
      return;
    }

    this.setState({ 
      isRecording: false, 
      recordingTime: 0, 
      currentTime: 0,
      progress: 0,
    });

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this.finishRecording(true, filePath);
      }

      return callback(filePath)
    } catch (error) {

      try {
        await AudioRecorder.stopRecording();
      } catch (e) {
        console.error('cant stop record', e);
      }

      if (this.props.onStopRecord) this.props.onStopRecord();

      console.error('stop===', error);
      this.setState({ finished: false, loaded: false, isUploading: false });

      return callback(null, error)
    }
  }

  async onAudioRecordCancel() {
    if (!this.state.isRecording) {
      console.warn('Can\'t stop, not recording!');
      return;
    }

    await AudioRecorder.stopRecording();
    this.setState({isRecording: false, currentTime: 0, progress: 0, finished: true, loaded: false, recordingTime: 0});
    
    clearInterval(this._recordInterval);
  }

  finishRecording(didSucceed, filePath, fileSize) {
    this.setState({ finished: didSucceed });
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
  }

  onAudioRecordStart(){

    if (this.props.onStartRecord) this.props.onStartRecord();

    if (!this.state.loaded) this.initRecordDevice();

    this._record();
  }

  onAudioRecordStop() {

    if (this.recordTotalTime > 2)
      this.stopAndSave();
    else {
      this._stop(() => {})
    }

    this.setState({ loaded: false });

    clearInterval(this._recordInterval);
  }

  onAudioRecordTimerStart() {
    this.recordTotalTime = 0;

    clearInterval(this._recordInterval);

    this._recordInterval = setInterval(() => {
      this.recordTotalTime = this.recordTotalTime + 1;
      this.setState({recordingTime: this.recordTotalTime});
    }, 1000);
  }

  onStartRecordFail(message, ex) {
    console.warn(message, ex);
    if (this.props.onStopRecord) this.props.onStopRecord();
  }

  onSaveRecordFail(err) {
    if (this.props.onStopRecord) this.props.onStopRecord();
    this.setState({ finished: false, isUploading: false, loaded: false });

    console.info('error onSaveRecordFail===', err)
  }

  onSaveRecordSuccess(data) {
    console.info('record saved success', data)

    //if(this.props.chatType == PRIVATE) this.refreshThread(data, this.props.recordsSource);

    this.setState({ finished: true, isUploading: false });
    console.log('upload success');

    if (this.props.onStopRecord) this.props.onStopRecord();
  }

  isMessageTooLong() {
    return this.state.currentTime > this.state.limitedRecordTime
  }

  renderRecordingModalMessage() {
    if(this.isMessageTooLong())
      return (
        <View style={styles.modalMessageContainer}>
          <Text style={styles.text}>{ Translator.t('record.sorry') }</Text>
          <Text style={styles.text}>{ Translator.t('record.message_too_long') }</Text>
          <Text style={styles.text}>{ Translator.t('record.message_max_duration', {max_duration: this.state.limitedRecordTime}) }</Text>
          <Text style={styles.text}>{ Translator.t('record.new_record', {max_duration: this.state.limitedRecordTime}) }</Text>
        </View>
      )

    return (
      <View style={styles.modalMessageContainer}>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.text}>{ Translator.t('record.message_max_duration', {max_duration: this.state.limitedRecordTime}) }</Text>
          </View>
          {
            Translator.lines('record.message_info', {chat_name: (this.props.recordsSource != null && this.props.recordsSource == ALL) ? 'Public' : 'Privé', max_duration: this.state.limitedRecordTime}, (text, index) => <Text key={'Text_INFO_' + index} style={styles.text}>{text}</Text>)
          }
          
      </View>
    )
  }

  renderRecordingModal() {
    
    return <Modal
        ref={"recording_show"}
        animationType="none"
        visible={this.state.isRecording}
        //backdropOpacity={0.4}
        //animationIn={{}}
        style={{padding: 0, margin: 0}}
        transparent={true}
      >
      <View style={styles.modalRecordingShow}>

          {
            this.renderRecordingModalMessage()
          }
          <View style={styles.modalButtonsContainer}>

            <View>
              <TouchableOpacity style={[styles.recordCancelContainer, {width: this.props.width, height: this.props.height}]} onPress={()=>this.onAudioRecordCancel()}>
                <Icon
                  name="close"
                  size={28}
                  borderWidth={2}
                  borderColor='red'
                  color={Colors.white}
                  size={Metrics.images.large} />
              </TouchableOpacity>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.text}>{TimerService.formatTimeToHHMMSS(this.state.recordingTime)}</Text>
            </View>
            
            <View style={styles.recordSaveButtonContainer}>

              <TouchableOpacity
                onPress={()=> this.isMessageTooLong() ? this.onAudioRecordCancel() : this.onAudioRecordStop() }>
                <View style={styles.progressContainer}>
                  <Progress.Circle
                    progress={this.state.progress}
                    color={styles.progress.color}
                    borderWidth={0}
                    thickness={styles.progress.width}
                    showsText={false}
                    size={this.props.width} />
                </View>
                
                <View
                  hitSlop={{top: 1, bottom: 1, left: 1, right: 10}}
                  style = {styles.recordSaveContainer}>
                    <LinearGradient
                      colors={Colors.gradientMainColorsSmooth}
                      locations={[0,0.2,1]}
                      start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                      style={[styles.recordSaveGradient, , {width: this.props.width, height: this.props.height}]}
                    >
                    <Image
                        style={{height: Metrics.images.xl, width: Metrics.images.xl}}
                        resizeMode='stretch'
                        source={Images.microOpened}
                    />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            
            </View>
          </View>
          
      </View>
    </Modal>
  }

  render () {
    return (
      <View style={styles.container}>
        {
          this.renderRecordingModal()
        }

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            hitSlop={{ top: 1, bottom: 1, left: 15, right: 15 }}
            style={{
              margin: 0,
              padding: 0
            }}
            onPress={() => this.props.recordsSource ? this.onAudioRecordStart() : null}
          >
            <View
              style = {[styles.recordButtonContainer, {width: this.props.width, height: this.props.height}]}>
                <LinearGradient
                  colors={this.props.recordsSource ? Colors.gradientMainColorsSmooth : Colors.gradientDisabled}
                  locations={[0,0.2,1]}
                  start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                  style={styles.recordButtonGradient}
                >
                <Image
                    style={{height: this.props.height / 2, tintColor: Colors.white}}
                    resizeMode='contain'
                    source={Images.icRecordBig}
                  />
                  
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
        <Modal
          animationType={'none'}
          transparent={true}
          visible={this.state.isUploading}>
          <BallIndicator color={Colors.mainColor} />
        </Modal>
      </View>
    )
  }
}

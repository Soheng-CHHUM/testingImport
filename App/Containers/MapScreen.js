
import React, { Component } from 'react'
import { ScrollView, Text, Button, Image, View, TouchableOpacity, ImageBackground, Dimensions, StyleSheet, PermissionsAndroid, Alert, Animated } from 'react-native'
import { connect } from 'react-redux'

// Styles
import MapStyles from './Styles/MapScreenStyle'
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import ChatScreen from './ChatScreen';
import UserService from '../Services/User'
import GroupService from '../Services/GroupService'
import GeoService, { USERS, ALERTS, ALERTS_ZONE_DE_DANGER } from '../Services/GeoService'
import Settings from '../Services/Settings'
import FirebaseService, { handleError } from '../Services/Firebase'

import Icon from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MessageList from '../Components/MessageList'
import RecordButton from '../Components/RecordButton';
import RecordZoneDeDangerButton from '../Components/RecordZoneDeDangerButton';
import ThreadList from '../Components/ThreadList'
import UserPopUp from '../Components/UserPopUp'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import styles from './Styles/ChatScreenStyle'
import FooterButtons from './FooterButtons'
import Metrics from '../Themes/Metrics'
import { NavigationActions, StackActions } from 'react-navigation'
import PremiumPopUp from '../Components/PremiumPopUp'
import Share from 'react-native-share';

import circle from '@turf/circle'
import { Container, Content } from 'native-base';


import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog';

import _ from 'lodash'
import LinearGradient from 'react-native-linear-gradient';
import { Images, ApplicationStyles } from '../Themes'
import UserLocationParkingActions from '../Redux/UserLocationParkingRedux'
import ThreadActions from '../Redux/ThreadRedux'
import { ALL } from '../Services/Enums/ChatTypes'

import UserAlertsActions from '../Redux/UserAlertsRedux'
import moment from 'moment'
import firebase from 'react-native-firebase';
import { TYPES as ALERT_TYPES, isAlertPV, isAlertZoneDanger } from '../Services/Alerts'
import SwipeablePanel from 'rn-swipeable-panel';
import AppConfig from '../Config/AppConfig'
const haversine = require('haversine')

const apiMapBoxKey = "pk.eyJ1Ijoia29uZ3N1biIsImEiOiJjanl6aXQ4ZG0wMW45M25tcnczbXB5aGNkIn0.BYCtQm_THk6VitiFpQPUdA";
MapboxGL.setAccessToken(apiMapBoxKey);
const coordinates = [
  [104.965324, 11.572051],

  [104.885021, 11.543124],
  [104.891885, 11.535723],
  [104.949538, 11.559942],
  [104.930320, 11.547833],
  [104.931937, 11.523724],
  [104.923872, 11.519687],
  [104.931778, 11.521387],
  [104.928954, 11.521438],
]
const getHeight = Dimensions.get('window').height
const bottomPixelMedium = (getHeight / 2) - 65 - 10;
const bottomPixelMoreThanMedium = (getHeight / 2) - 65 - 10 - 200;
// const bottomPixelMedium = getHeight / 2 + 10;
// const bottomPixelSmall = 200 + 10;
const bottomPixelSmall = (getHeight - 200) - 65 - 10;

const Admob = firebase.admob()
const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest().addTestDevice()

class MapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonStylesAnimation: new Animated.Value(0),
      swipeablePanelBlockChatActive: false,
      coordinates: coordinates,
      isPubChatSelected: true,
      premiumAnimationDialog: false,
      welcomeAnimationDialog: false,
      EditGroupAnimationDialog: false,
      usersData: [],
      recordsSource: ALL,
      isClickedParkingOrAlertZone: null, //if true = parking, else alert zone: but null is nothing.
      statusParkingDialog: false,
      statusAlertPVDialog: false,
      isClickedParkingBtn: false,
      refreshToReRender: true,
      isClickedAlertZoneBtn: false,
      isParkingBlockDisplayed: true,
      isUserPopUpVisible: false,
      coordinateCurrentUser: [0, 0],
      currentAddress: '',
      isInAlertPV: false,
      on_press_title: null,
      chatroom: null,
      isClickOnEachGroup: false,
      groupInfo: {},
      isOwnerGroup: false,
      isPopUpPremiumVisible: false,
      nbUsersOnline: 0,
      selectedUser: [],
      isInsideZoneAlertPv: false,
      isInsideZoneDeDangerAlert: false
    };

    this.alertsNotificationReceived = {}
    this.tempPublicUsers = [];

    this.watchID = null;
    this.isZoneActivated = false;
    this.isAlertPVclicked = null
    this.isAlertIndexClicked = null
    this.isTypeOfAlertDisplayed = false;
    this.typeOfAlertZone = ["ALERTE\nPV", "ZONE DE\nDANGER"];

    this.isParkingActivated = false;
    this.coordinateParkingInAlert = [];

    this.isAlertZoneDeDangerActivated = false;
    this.isListenAlertZoneDeDangerActivated = false;
    this.coordinateAlertZoneDeDanger = [[0, 0]];
    this.coordinateListenAlertZoneDeDanger = [[0, 0]];

    this.isAlertPVActivated = false;
    this.coordinateAlertPV = [[0, 0]];

    this.isDisplayedDialogBlock = false;


    this.heightMapScreen = 0;
    this.heightDialogScreen = 0;

    this.isTwoBtnOfParkingAndAlertZoneClicked = false;
    this.isToggleBtnAlertZone = false;
    this.coordinateLastPositionUser = [0, 0];
    this.isDisplayUserLocationPoint = true;
    this.curUser = this.props.user;

    this.displayCurrentPosition = null;

    this.initialRegion = [0, 0];
    global.searchFromScreen = ''


    this.statusMovingSwipe = false;
    this.countMovingSwipe = 0;
    this.sizeLevelSwipe = "medium";

    this.isChanged = false;


    this.currentTop = 0;

    if (props.user) GeoService.isObservable = !props.user.invisible;
  }

  buttonStylesAnimation = () => {
    this.state.buttonStylesAnimation.setValue(0)
    Animated.timing(
      this.state.buttonStylesAnimation,
      {
        toValue: 1,
        duration: 1000,
      }
    ).start();
  }

  componentDidMount = async () => {

   

    this.buttonStylesAnimation();
    this.handleOpenSwipeablePanelBlockChat();
    this.handleGetCurrentLocation();
    this.handleGettingUserLocationParkingFromRedux();
    UserService.getLocation(this.curUser.Key);
    await this.requestGpsPermission()

    if (!this.props.currentThread) this.props.setCurrentThread(this.state.recordsSource)

    if (!this.canAccessGps) return

    GeoService.setRadius(ALERTS, AppConfig.nbKmCircleAlertPV)
    GeoService.setRadius(ALERTS_ZONE_DE_DANGER, AppConfig.nbKmCircleZoneDanger)
  }

  handleResultPosition = (position) => {
    let { coordinateCurrentUser } = this.state
    coordinateCurrentUser = [position.coords.longitude, position.coords.latitude];
    this.coordinateLastPositionUser = coordinateCurrentUser;
    let location = [position.coords.latitude, position.coords.longitude];
    this.initialRegion = coordinateCurrentUser;
    this.setUserLocation(location);
    this.calculateAlertToGetTheNearest(position);
    this.handleGetAddressFromLatlon(position.coords.latitude, position.coords.longitude);
    this.setState({
      coordinateCurrentUser, currentLocation: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    });
  }


  calculateAlertToGetTheNearest = (position) => {

    const start_lat_lon = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }

    let isInsideZoneDeDangerAlert = false
    let isInsideZoneAlertPv = false

    this.coordinateAlertPV.map((eachAlertPv) => {
      const end_lat_lon = {
        latitude: eachAlertPv[1],
        longitude: eachAlertPv[0]
      }
      const calculate_lat_lon = haversine(start_lat_lon, end_lat_lon);

      if (AppConfig.nbKmCircleAlertPV >= Number(calculate_lat_lon)) {
        isInsideZoneAlertPv = true
      }
    })

    this.coordinateAlertZoneDeDanger.map((eachAlertZoneDeDanger) => {
      const end_lat_lon = {
        latitude: eachAlertZoneDeDanger[1],
        longitude: eachAlertZoneDeDanger[0]
      }
      const calculate_lat_lon = haversine(start_lat_lon, end_lat_lon);
      if (AppConfig.nbKmCircleZoneDanger >= Number(calculate_lat_lon)) {
        isInsideZoneDeDangerAlert = true;
      }
    })

    this.setState({ isInsideZoneAlertPv, isInsideZoneDeDangerAlert });
  }
  //coordinateCurrentUser

  handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.handleResultPosition(position);
      },
      (error) => { },
      { enableHighAccuracy: true }
    );

    this.watchID = navigator.geolocation.watchPosition((position) => {
      this.handleResultPosition(position);
    });
  }
  componentWillUnmount = () => {
    if (this.watchID) navigator.geolocation.clearWatch(this.watchID);
  }
  componentWillReceiveProps = (props) => {
    if (props.user) {
      this.curUser = props.user;
      GeoService.isObservable = !props.user.invisible;
    }

    if (props.currentThread && props.currentThread != this.state.recordsSource) {
      this.setState({ recordsSource: props.currentThread })
    } else if (!props.currentThread && this.state.recordsSource && !this.state.isPubChatSelected)
      this.setState({ recordsSource: null })
    if (props.userSettings) {
      let usersDataListener = []
      GeoService.listenUsers((key, location, distance) => {
        if (key && this.state.isPubChatSelected) {
          FirebaseService.database().ref('/users/' + key).once('value', (snapshot) => {
              if (snapshot.val() && snapshot.val().Avatar) {
                let avatar = snapshot.val().Avatar
                UserService.isUserBlocked(this.curUser.key, key)
                  .then(isBlocked => {
                    if (isBlocked || (snapshot.key != this.curUser.key && snapshot.val().invisible)) return
                    usersDataListener.push(
                      {
                        key: key,
                        location: location,
                        distance: distance,
                        avatar: avatar,
                        userData: snapshot.val(),
                        invisible: snapshot.val()?snapshot.val().invisible:false
                      }
                    )
                    // this.tempPublicUsers = usersDataListener;
                    this.setState({ usersData: usersDataListener });
                  })
              }
          });
        }


        // GeoService.stopListen(USERS) //stop listen this
      })
      GeoService.setRadius(USERS, props.userSettings.nbKmLimitZone)

    }
  }

  setUserLocation = (location) => {
    GeoService.setUserLocation(this.curUser.Key, location, (isSuccess, err) => {
    })
  }

  requestGpsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Bebeep',
          message:
            'Bebeep doit récupérer votre position pour pouvoir afficher la carte',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.canAccessGps = true
      } else {
        this.canAccessGps = false
      }
    } catch (err) {
      this.canAccessGps = false
    }
  }

  handleGettingUserLocationParkingFromRedux = () => {
    let { coordinateCurrentUser } = this.state
    if (this.props.userLocationParking) {
      const { parkingData } = this.props.userLocationParking
      if (parkingData) {
        this.setUserLocation(parkingData.location)

        this.isParkingActivated = true;
        this.isTwoBtnOfParkingAndAlertZoneClicked = false;
        this.isDisplayedDialogBlock = false;
        coordinateCurrentUser = parkingData.coordinateCurrentUser
        this.coordinateLastPositionUser = coordinateCurrentUser;

        this.handleGetAddressFromLatlon(coordinateCurrentUser[1], coordinateCurrentUser[0]);
        this.setState({ coordinateCurrentUser, isClickedParkingBtn: false, isParkingBlockDisplayed: true, isClickedAlertZoneBtn: false });
      }
    }
  }

  handleGetAddressFromLatlon = (lat, lon) => {
    return fetch('https://api.mapbox.com/v4/geocode/mapbox.places/' + lon + ',' + lat + '.json?access_token=' + apiMapBoxKey)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson) {
          this.setState({ currentAddress: responseJson.features[0].place_name });
        }
      })
  }

  handleCalSecToRemoveAlert = (coordinateAlertVar, isAlertActivateVar, alertData, functionName, alert_type) => {
    alertData.map((eachAlertData) => {
      const { create_date, location, alertKey } = eachAlertData;
      var countSec = moment().diff(create_date, 'seconds');
      var countSecConvertToTimeOut = 1200000 - (countSec * 1000);
      this[isAlertActivateVar] = true;
      this[coordinateAlertVar].push(eachAlertData[coordinateAlertVar])
      messageKeyZoneDeDanger = null;
      if (alert_type == "alert_zone_de_danger") {
        messageKeyZoneDeDanger = eachAlertData['recordedData'].key;
      }
      this[functionName](countSecConvertToTimeOut, alertKey, location, messageKeyZoneDeDanger);
    })

  }

  componentWillMount() {
    if (this.props.userAlerts) {
      // alert pv
      let { alertPvData, alertZoneDeDangerData } = this.props.userAlerts
      if (alertPvData) {
        this.handleCalSecToRemoveAlert('coordinateAlertPV', 'isAlertPVActivated', alertPvData, 'setTimeToRemoveAlertPV', 'alerts')
      }
      // alert zone de danger
      if (alertZoneDeDangerData) {
        this.handleCalSecToRemoveAlert('coordinateAlertZoneDeDanger', 'isAlertZoneDeDangerActivated', alertZoneDeDangerData, 'setTimeToRemoveAlertZoneDeDanger', 'alert_zone_de_danger')
      }
    }
    let usersDataListener = []
    GeoService.listenUsers((key, location, distance) => {
      if (key && this.state.isPubChatSelected) {
        FirebaseService.database().ref('/users/' + key).once('value', (snapshot) => {
            if (snapshot.val() && snapshot.val().Avatar) {
              let avatar = snapshot.val().Avatar
              UserService.isUserBlocked(this.curUser.key, key)
                .then(isBlocked => {
  
                  if (isBlocked || (snapshot.key != this.curUser.key && snapshot.val().invisible)) return
  
                  usersDataListener.push(
                    {
                      key: key,
                      location: location,
                      distance: distance,
                      avatar: avatar,
                      userData: snapshot.val(),
                      invisible: snapshot.val()?snapshot.val().invisible:false
                    }
                  )
                  this.tempPublicUsers = usersDataListener;
                  this.setState({ usersData: usersDataListener });
                })
            }


         
        });
      }


      // GeoService.stopListen(USERS) //stop listen this
    })
    if (this.props.userSettings) {
      GeoService.setRadius(USERS, this.props.userSettings.nbKmLimitZone)
    }

    GeoService.listenAlerts((key, location, distance) => {

      if (this.alertsNotificationReceived[key]) return

      this.coordinateAlertPV.push([location[1], location[0]]);

      UserService.enterPvZone(location, () => { })

      this.alertsNotificationReceived[key] = true

      this.setState({ refreshToReRender: true });
    }, (key, location) => {

      this.alertsNotificationReceived[key] = false

      this.coordinateAlertPV = this.coordinateAlertPV.filter(alert => {
        if (alert[0] != location[1]) return true
        if (alert[1] != location[0]) return true

        return false
      })

      this.setState({ refreshToReRender: true });
    });

    GeoService.listenAlertsZoneDeDanger((key, location, distance) => {

      if (this.alertsNotificationReceived[key]) return

      this.isListenAlertZoneDeDangerActivated = true;
      this.alertsNotificationReceived[key] = true
      this.coordinateListenAlertZoneDeDanger.push([location[1], location[0]]);

      UserService.enterDangerZone(location, () => { })

      this.setState({ refreshToReRender: true });
    }, (key, location) => {
      this.coordinateListenAlertZoneDeDanger = this.coordinateListenAlertZoneDeDanger.filter(alert => {
        if (alert[0] != location[1]) return true
        if (alert[1] != location[0]) return true

        return false
      })

      this.alertsNotificationReceived[key] = false
      this.setState({ refreshToReRender: true });
    });


  }

  handlePressUserOnMap = (user) => {
    this.setState({ selectedUser: user, isUserPopUpVisible: true });
  }

  renderAnnotation = (eachUser, index) => {
    const id = `pointAnnotation${index}`;
    const { location, avatar, userData } = eachUser;
    const coordinate = [location[1], location[0]];
    return (
      <MapboxGL.PointAnnotation
        key={id}
        id={id}
        title={userData.Name}
        coordinate={coordinate}>
        <TouchableOpacity onPress={() => this.handlePressUserOnMap(userData)}>
          <Image
            source={{ uri: avatar }}
            style={{
              // flex: 1,
              // resizeMode: 'contain',
              width: 40,
              height: 40,
              borderRadius: 20
            }} />
        </TouchableOpacity>
      
      </MapboxGL.PointAnnotation>
    );
  }

  renderAnnotations = () => {
    const items = [];
    let { usersData } = this.state;
    const filterUniqueKeyUsers = _.uniqBy(usersData, 'key');
    filterUniqueKeyUsers.map((eachUser, index) => {
      if(eachUser.invisible==true) return false;
      if (eachUser.key == this.curUser.Key) return false;
      items.push(this.renderAnnotation(eachUser, index));
    })
    return items;
  }
  onPremiumPopUpVisibilityChanged(isVisible) {
    if (isVisible != this.state.isPopUpPremiumVisible) {
      this.setState({ isPopUpPremiumVisible: isVisible })
    }
  }
  handlePressChat = (status) => {
    if (status) {
      this.state.isPubChatSelected = status;
      this.props.setCurrentThread(status ? ALL : null)
      this.setState({ usersData: this.tempPublicUsers, isPubChatSelected: status, recordsSource: status ? ALL : null, on_press_title: null });
    }
    else {
      if (this.props.user && this.props.user.isPremium) {
        this.state.isPubChatSelected = status;
        this.props.setCurrentThread(status ? ALL : null)
        this.setState({ isPubChatSelected: status, recordsSource: status ? ALL : null, on_press_title: null });
      }
      else {
        this.setState({ isPopUpPremiumVisible: !this.state.isPopUpPremiumVisible })
      }

    }
  }

  isClickedParkingOrAlertZone = (status) => {
    let { statusParkingDialog, isClickedParkingOrAlertZone } = this.state
    isClickedParkingOrAlertZone = status
    if (status) {
      statusParkingDialog = status
    } else {
      this.isTypeOfAlertDisplayed = !this.isTypeOfAlertDisplayed
    }
    this.setState({ isClickedParkingOrAlertZone, statusParkingDialog });
  }

  handleEditProfile = () => {
    this.props.navigation.navigate("EditProfileScreen");
  }

  handleInviteContact = () => {
    this.props.navigation.navigate("InviteContactScreen");
  }

  handleShowProfile = (user) => {
    if (this.props.user && user.key == this.props.user.key) return
    this.setState({ selectedUser: user, isUserPopUpVisible: true })
  }

  handleOnPressThreadList = (user, chatroom) => {
    let clickOnUserOrGroup = null;
    if (chatroom && chatroom.users) {
      let usersDataListener = [];
      chatroom.users.map((eachUserKey, indexeachUserKey) => {
        UserService.getUserDetail(eachUserKey, (userData, location) => {
            if (userData) {
              usersDataListener.push(
                {
                  key: userData.Key,
                  location: location,
                  distance: 0,
                  avatar: userData.Avatar,
                  userData: userData,
                  invisible: userData?userData.invisible:false
                }
              )
              this.setState({ usersData: usersDataListener });
            }

        })
      })
    }

    GroupService.getDetail(chatroom.groupID, (groupInfo) => {
      this.setState({ on_press_title: groupInfo ? "group" : null, groupInfo: groupInfo ? groupInfo : {} });
    })
    global.chatroom = chatroom;
    // this.setState({on_press_title: "group", chatroom}); old code
    this.setState({ on_press_title: chatroom.groupID ? "group" : "not_group", chatroom, isClickOnEachGroup: true });
    // this.setState({ chatroom, isClickOnEachGroup: true });
    if (this.isCancelled) return;
    UserService.reloadThread(chatroom.key);
    this.props.setCurrentThread(chatroom.key)
  }

  handleOnPressSendPrivateChatUserPopup = (user, chatroom) => {
    if (chatroom && chatroom.users) {
      let usersDataListener = [];
      let nbUsersOnline = 0;
      chatroom.users.map((eachUserKey) => {
        UserService.getUserDetail(eachUserKey, (userData, location) => {
              if (userData) {
                nbUsersOnline += 1;
                usersDataListener.push(
                  {
                    key: userData.Key,
                    location: location,
                    distance: 0,
                    avatar: userData.Avatar,
                    userData: userData,
                    invisible: userData?userData.invisible:false
                  }
                )
                this.setState({ usersData: usersDataListener, nbUsersOnline: nbUsersOnline });
              }

        })
      })

    }
    this.setState({ on_press_title: null, chatroom, isClickOnEachGroup: true });
    if (this.isCancelled) return;
    UserService.reloadThread(chatroom.key);
    this.props.setCurrentThread(chatroom.key)
  }

  handleClickOnDetailGroup = () => {
    const userKey = this.props.user.Key
    const createByKey = this.state.groupInfo.createdBy
    if (userKey != createByKey) {
      this.setState({ EditGroupAnimationDialog: true, isOwnerGroup: false });
    }
    else {
      this.setState({ EditGroupAnimationDialog: true, isOwnerGroup: true, isPubChatSelected: true });

    }
  }

  handleOnEditGroup = () => {
    this.props.navigation.navigate("GroupAdmin", { groupInfo: this.state.groupInfo, chatroom: this.state.chatroom })
    this.setState({ EditGroupAnimationDialog: false });
  }

  handleOnDeletGroup = () => {
    let { chatroom } = this.state
    Alert.alert(
      'Attention',
      ' Êtes-vous sûr de vouloir supprimer le groupe ?',
      [
        { text: 'Non', onPress: () => console.log('Cancel'), style: 'cancel' },
        {
          text: 'Oui', onPress: () => {
            GroupService.deletedGroup(chatroom.groupID, chatroom.key)
            this.setState({ isClickOnEachGroup: false, EditGroupAnimationDialog: false })
            this.handlePressChat(true)
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
            });
            this.props.navigation.dispatch(resetAction);
          }
        },
        { cancelable: false },
      ],
    );
  }

  handleOnLeaveGroup = () => {
    let { chatroom, groupInfo } = this.state
    Alert.alert(
      'Attention',
      ' Êtes-vous sûr de vouloir quitter le groupe?',
      [
        { text: 'Non', onPress: () => console.log('Cancel'), style: 'cancel' },
        {
          text: 'Oui', onPress: () => {
            let allUsersKey = groupInfo.users
            let keyIndex = allUsersKey.findIndex(key => key == this.props.user.Key);
            if (keyIndex >= 0) {
              allUsersKey.splice(keyIndex, 1);
              GroupService.updateGroup(chatroom.groupID, { users: allUsersKey })
              GroupService.deleteUserFromRegistrations(this.props.user.Key, chatroom.groupID)
              this.setState({ isClickOnEachGroup: false, EditGroupAnimationDialog: false });
              this.handlePressChat(false)
            }
          }
        },
        { cancelable: false },
      ],
    );

  }
  handleOnBackIconOfGroupClicking = () => {
    // const resetAction = StackActions.reset({
    //   index: 0,
    //   actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
    // });
    // this.props.navigation.dispatch(resetAction);
    this.setState({ isPubChatSelected: false, isClickOnEachGroup: false });
    this.handlePressChat(false);
  }

  handleOpenSwipeablePanelBlockChat = () => {
    this.setState({ swipeablePanelBlockChatActive: true });
  };

  // handleCloseSwipeablePanelBlockChat = () => {
  //     this.setState({ swipeablePanelBlockChatActive: false });
  // };

  parkingButton = () => {
    return (
      <TouchableOpacity onPress={this.handleClickingParking} style={{
        top: -80,
        left: 10,
        width: 65,
        height: 65,
        borderRadius: 65,
        position: 'absolute',
      }}>
        <Image source={
          this.isParkingActivated || this.state.isClickedParkingBtn ?
            Images.activeParking
            : Images.parking}
          style={{ width: 65, height: 65 }} />
      </TouchableOpacity>
    )
  }

  AlertAndZoneButton = () => {
    return (

      <TouchableOpacity onPress={this.handleClickingAlertZoneBtn} style={{
        top: -80,
        right: 10,
        width: 65,
        height: 65,
        borderRadius: 65,
        position: 'absolute'
      }}>
        <Image source={
          this.state.isClickedAlertZoneBtn ?
            Images.activeAlertZone
            :
            this.state.isClickedAlertZoneBtn == false && this.isTypeOfAlertDisplayed ?
              Images.activeAlertZone
              :
              Images.alertZone
        } style={{ width: 65, height: 65 }} />
      </TouchableOpacity>
    )
  }

  handleMovingWindow = (status, sizeLevelSwipe, currentTop, isChanged) => {
    this.currentTop = currentTop;
    this.sizeLevelSwipe = sizeLevelSwipe;
    this.statusMovingSwipe = status;
    this.isChanged = isChanged
    this.setState({ coordinateCurrentUser: this.state.coordinateCurrentUser });
    if (status) {
      if (this.countMovingSwipe < 1) {
        this.countMovingSwipe += 1;
        this.currentTop = 0;

        this.setState({ refreshToReRender: true });
      }
    } else {
      this.countMovingSwipe = 0;
      this.currentTop = 0;

      this.buttonStylesAnimation();
      this.setState({ refreshToReRender: true });
    }
  }

  handleBlockChatting = () => {
    const { isPubChatSelected, groupInfo, usersData, chatroom } = this.state;
    let numUsers = groupInfo && groupInfo.users
      ?
      chatroom.users.length
      : 0;
    // let numUsers = chatroom && chatroom.users ? chatroom.users.length : 0;
    // let numUsers = chatroom.users ? chatroom.users.length : 0
    var onlineUsers = 0;
    usersData.map((eachUser) => {
      if (eachUser.userData.status == "online") {
        onlineUsers += 1;
      }
    })
    return (

      <SwipeablePanel
        style={{
          height: '100%',
          padding: 10,
        }}
        isActive={this.state.swipeablePanelBlockChatActive}
        parkingButton={this.parkingButton}
        AlertAndZoneButton={this.AlertAndZoneButton}
        // handleGetWindowChatMoving = {this.handleGetWindowChatMoving}
        handleMovingWindow={(status, sizeLevelSwipe, currentTop, isChanged) => this.handleMovingWindow(status, sizeLevelSwipe, currentTop, isChanged)}
      >
        {/* <View style={[internalStyles.headerOfDialog, { height: this.heightDialogScreen }]}> */}
        {/*  - - - -- -  --  - Chat container  - - - - - - --  */}
        {/* <View style={ApplicationStyles.topLine} /> */}
        {this.state.isClickOnEachGroup ?
          <View style={{ paddingLeft: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={this.handleOnBackIconOfGroupClicking} style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name='chevron-left' size={18} /><Text style={{ fontSize: 18, color: 'black', left: 5 }}>Retour</Text>
                </TouchableOpacity>

              </View>
              {
                numUsers ?
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 12, marginTop: 5 }}>
                    <TouchableOpacity onPress={this.handleClickOnDetailGroup}>
                      <Icon name='ellipsis-h' size={23} color='black' />
                    </TouchableOpacity>
                  </View>
                  : null
              }
            </View>
            {
              numUsers ?
                <View style={{ marginTop: 10, paddingLeft: 10 }}>
                  <Text style={{ fontSize: 22, color: 'black', fontWeight: 'bold' }}>{groupInfo.name}</Text>
                </View>
                : null
            }
            {
              numUsers ?
                <View style={{ flexDirection: 'row', paddingLeft: 10, marginTop: 7 }}>
                  <View><IconMaterialCommunityIcons name='account-multiple' size={18} color='black' /></View>
                  <View style={{ marginLeft: 10 }}><Text style={{ color: 'black' }}>· {numUsers} utilisateurs · {onlineUsers} en ligne 👍🏼</Text></View>
                </View>
                : null
            }

          </View>
          :
          <View>
            <View style={styles.btnTitleContainer}>
              {/* -- - - - - - - - - --  tab Chat public and Private - - --  -- - - - - -  - - */}
              <TouchableOpacity onPress={() => this.handlePressChat(true)} style={[styles.chatButton, { backgroundColor: isPubChatSelected ? 'black' : '#FAFAFA', right: 20 }]}>
                <Text style={{ fontSize: 15, color: isPubChatSelected ? 'white' : 'black' }}>Chat Public</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.handlePressChat(false)} style={[styles.chatButton, { flexDirection: 'row', backgroundColor: !isPubChatSelected ? 'black' : '#FAFAFA' }]}>
                <Text style={{ fontSize: 15, color: !isPubChatSelected ? 'white' : 'black', marginRight: 8 }}>Chat Privé</Text>
                {
                  this.props.user && this.props.user.nbUnreadMessages ?
                    <Text style={{ fontSize: 15, color: 'white', backgroundColor: '#B360D2', paddingLeft: 8, paddingRight: 8, borderRadius: 8 }}>
                      {this.props.user.nbUnreadMessages}
                    </Text>
                    : null
                }

              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.handleOnClickOnSearchIcon}
                style={[styles.searchContainer, { left: 10 }]}>
                <Icon name='search' size={18} />
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 12, flexDirection: 'row' }}>
              <Icon name='map-marker' size={20} color='black' />

              {/* {
                this.props.userSettings &&
                <Text style={{ color: 'black', marginLeft: 10 }}>{this.props.userSettings.nbKmLimitZone}km autour de vous</Text>
              } */}

              {
                this.props.userSettings ? <Text style={{ color: 'black', marginLeft: 10 }}>{this.props.userSettings.nbKmLimitZone}km autour de vous</Text> : <Text style={{ color: 'black', marginLeft: 10 }}> 5km autour de vous</Text>
              }
            </View>
          </View>
        }

        {/* public chat */}
        <View style={{
          height:
            this.sizeLevelSwipe == "large" ?
              '100%'
              : this.sizeLevelSwipe == "medium" ?
                getHeight / 2.5
                :
                this.sizeLevelSwipe == "morethan_medium" ?
                  (getHeight / 2.5 + 200)
                  : 200
          , paddingBottom: 50
        }}>
          {
            isPubChatSelected || (this.state.recordsSource != ALL && this.state.recordsSource) ?
              <MessageList
                ref={component => this._messageListRef = component}
                currentLocation={this.state.currentLocation}
                recordsSource={this.state.recordsSource}
                onProfileShow={(user) => this.handleShowProfile(user)}
                shouldPlayLastRecord={true}
                user={this.curUser}
              />
              :
              <ThreadList
                user={this.curUser}
                handlePressUserOnMap={(user) => this.handlePressUserOnMap(user)}
                onPress={(user, chatroom) => this.handleOnPressThreadList(user, chatroom)} />
          }

        </View>


        {/* --------Premium Dialog-------- */}
        <Dialog
          onDismiss={() => {
            this.setState({ premiumAnimationDialog: false });
          }}
          onTouchOutside={() => {
            this.setState({ premiumAnimationDialog: false });
          }}
          width={Dimensions.get('window').width}
          visible={this.state.premiumAnimationDialog}
          dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
          dialogStyle={{ position: 'absolute', bottom: 0 }}
        >
          <View style={ApplicationStyles.topLine} />
          <TouchableOpacity
            style={{ right: 0, position: 'absolute', margin: 10 }}
            onPress={() => { this.setState({ premiumAnimationDialog: false }) }}
          >
            <Ionicons name='md-close-circle' size={24} />
          </TouchableOpacity>
          <DialogContent style={{ justifyContent: 'center', marginTop: 10 }}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.txtDescription}>Passez en version premium pour envoyer des messages privés, faire des rencontres et créer vos groupes.</Text>
              <Text style={[styles.txtDescription, { marginTop: 20 }]}>Le prix d'abonnement est de 0.99 €. Testez-le gratuitement pendant 1 mois !</Text>
            </View>
            <View style={styles.btnConfirmContainer}>
              <TouchableOpacity
                style={styles.btnConfirmStyle}
                onPress={() => {
                  this.setState({ welcomeAnimationDialog: true });
                  this.setState({ premiumAnimationDialog: false });

                }}
              >
                <Text style={styles.txtDescription}>Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirmStyle}
                onPress={() => { this.setState({ premiumAnimationDialog: false }) }}
              >
                <Text style={styles.txtDescription}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </DialogContent>
        </Dialog>
        {/* --------------Welcome Dialog-------------  */}
        <Dialog
          onDismiss={() => {
            this.setState({ welcomeAnimationDialog: false });
          }}
          onTouchOutside={() => {
            this.setState({ welcomeAnimationDialog: false });
          }}
          width={Dimensions.get('window').width}
          visible={this.state.welcomeAnimationDialog}
          dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
          dialogStyle={{ position: 'absolute', bottom: 0 }}>
          <View style={ApplicationStyles.topLine} />
          <TouchableOpacity
            style={{ right: 0, position: 'absolute', margin: 10 }}
            onPress={() => { this.setState({ welcomeAnimationDialog: false }) }}>
            <Ionicons name='md-close-circle' size={24} />
          </TouchableOpacity>
          <DialogContent style={{ justifyContent: 'center', marginTop: 10 }}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.txtDescription}>Bienvenue ! ☺️</Text>
              <Text style={[styles.txtDescription, { marginTop: 20 }]}>Vous êtes en version premium ! Retrouvez vos groupes d'intérêt et vos amis</Text>
            </View>
            <View style={styles.btnConfirmContainer}>
              <TouchableOpacity
                style={styles.btnConfirmStyle}
                onPress={() => {
                  this.setState({
                    welcomeAnimationDialog: false
                  })
                }}>
                <Text style={styles.txtDescription}>Premium</Text>
              </TouchableOpacity>
            </View>
          </DialogContent>
        </Dialog>

        {/* --------EditProfile Dialog----------*/}
        <Dialog
          onDismiss={() => {
            this.setState({ EditGroupAnimationDialog: false });
          }}
          onTouchOutside={() => {
            this.setState({ EditGroupAnimationDialog: false });
          }}
          width={Dimensions.get('window').width - 5}
          visible={this.state.EditGroupAnimationDialog}
          dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
          dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: 'transparent' }}>
          <View style={ApplicationStyles.topLine} />
          <DialogContent style={{ marginTop: 10 }}>
            <TouchableOpacity style={{ backgroundColor: '#DFDDDC', paddingTop: 13, paddingBottom: 13, borderTopRightRadius: 13, borderTopLeftRadius: 13 }}>
              <Text style={{ fontSize: 20, color: '#B360D2', textAlign: 'center' }}>{this.state.groupInfo ? this.state.groupInfo.name : ''}</Text>
            </TouchableOpacity>
            <View style={{ borderBottomColor: '#282829', borderBottomWidth: 0.7 }} />
            {/* check is owner of group or not */}
            {this.state.isOwnerGroup ?
              <View>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#DFDDDC', paddingTop: 13, paddingBottom: 15 }} onPress={this.handleOnEditGroup}>
                  <Text style={{ fontSize: 15, color: 'black', textAlign: 'center' }}>Editer le groupe</Text>
                </TouchableOpacity>
                <View style={{ borderBottomColor: '#282829', borderBottomWidth: 0.7 }} />
              </View>
              : null
            }
            {/* end check is owner of group or not */}

            {this.state.isOwnerGroup ?
              <View>
                <TouchableOpacity onPress={this.handleOnDeletGroup} style={{ flex: 1, backgroundColor: '#DFDDDC', paddingTop: 13, paddingBottom: 13, borderBottomLeftRadius: 13, borderBottomRightRadius: 10 }}>
                  <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}> Supprimer le groupe</Text>
                </TouchableOpacity>
              </View>
              :
              <View>
                <TouchableOpacity onPress={this.handleOnLeaveGroup} style={{ flex: 1, backgroundColor: '#DFDDDC', paddingTop: 13, paddingBottom: 15, borderBottomLeftRadius: 13, borderBottomRightRadius: 10 }}>
                  <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>Quitter le groupe</Text>
                </TouchableOpacity>
              </View>
            }


            <TouchableOpacity style={{ flex: 1, backgroundColor: 'white', paddingTop: 13, paddingBottom: 13, marginTop: 6, borderRadius: 13 }} onPress={() => this.setState({ EditGroupAnimationDialog: false })}>
              <Text style={{ fontSize: 20, color: 'black', textAlign: 'center' }}>Annuler</Text>
            </TouchableOpacity>

          </DialogContent>


        </Dialog>
        {/* --------End EditProfile Dialog----------*/}
        {/* </View > */}
        {/* <View style={{bottom: 0, right: 0, left: 0}}>
            <FooterButtons chatroom={this.state.chatroom} on_press_title={this.state.on_press_title} currentLocation={this.state.currentLocation} user={this.props.user} recordsSource={this.state.recordsSource} handleEditProfile={this.handleEditProfile} handleInviteContact={this.handleInviteContact} />
          </View> */}

      </SwipeablePanel>
    )
  }

  // handleCancelDialogParking = () => {
  //   let { isClickedParkingOrAlertZone } = this.state
  //   if (!this.isParkingActivated) {
  //     isClickedParkingOrAlertZone = null
  //   }
  //   this.displayCurrentPosition = false;
  //   this.setState({ statusParkingDialog: false, isClickedParkingOrAlertZone });
  // }

  // handleCancelDialogAlertPV = () => {
  //   this.displayCurrentPosition = false;
  //   this.isAlertIndexClicked = null;
  //   this.setState({ statusAlertPVDialog: false });
  // }

  handleActivateDialogParking = (status) => {
    this.sizeLevelSwipe = "medium";
    let location = [this.coordinateLastPositionUser[1], this.coordinateLastPositionUser[0]];
    var nbKmLimitZone = 0;
    if (this.props.userSettings) {
      nbKmLimitZone = this.props.userSettings.nbKmLimitZone
    }
    if (status) {
      GeoService.setLocationWithoutRecording(ALERTS, location, () => { })
      UserService.registerLocation(this.curUser.Key, location, nbKmLimitZone, (alert, isSuccess, err) => { })
      let parkingData = {
        userKey: this.curUser.Key,
        location: location,
        coordinateCurrentUser: this.coordinateLastPositionUser,
      }
      this.props.registerLocationParking(parkingData)
    } else {
      this.props.removeLocationParking()
      UserService.removeLocation(this.curUser.Key, location);
    }

    this.isParkingActivated = status;
    this.isDisplayedDialogBlock = false;
    this.isTwoBtnOfParkingAndAlertZoneClicked = false;
    this.setState({ isClickedParkingBtn: !this.state.isClickedParkingBtn });
  }

  dialogParking = () => {
    return (
      <View style={[internalStyles.headerOfDialog, { height: this.heightDialogScreen }]}>
        <View style={ApplicationStyles.topLine} />
        <TouchableOpacity style={{ right: 0, position: 'absolute', margin: 10 }} onPress={this.handleCancelPopupParking}>
          <Ionicons name='md-close-circle' style={{ color: "#3C3C3C" }} size={24} />
        </TouchableOpacity>

        <View style={{ justifyContent: 'space-around', height: "100%", flexDirection: 'column', paddingBottom: 20 }}>
          <Text style={styles.txtDescription}>
            {
              this.isParkingActivated ?
                "Desactiver ma position"
                :
                "Enregistrer mon parking"
            }
          </Text>
          <Text style={[styles.txtDescription, { color: '#B360D2' }]}>{this.state.currentAddress}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <LinearGradient
              start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
              locations={[0, 0.6]}
              colors={['#C20657', '#B360D2']}
              style={internalStyles.gradientBtn}>
              <TouchableOpacity
                style={ApplicationStyles.linearGradiantButton}
                onPress={() => this.handleActivateDialogParking(this.isParkingActivated ? false : true)}>
                <Text style={{ fontSize: 18, color: 'white' }}>
                  {
                    this.isParkingActivated ?
                      "Desactiver"
                      :
                      "Activer l'alerte"
                  }
                </Text>
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity
              style={styles.btnConfirmStyle}
              onPress={this.handleCancelPopupParking}
            >
              <Text style={styles.txtDescription}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  handleCancelPopupDialogAlertPV = () => {
    this.isAlertIndexClicked = null;
    this.isDisplayedDialogBlock = false;
    this.isTwoBtnOfParkingAndAlertZoneClicked = false;
    this.setState({ isClickedParkingBtn: false, isParkingBlockDisplayed: true, isClickedAlertZoneBtn: false });
  }

  handleCancelPopupDialogAlertZoneDanger = () => {
    //   ...
    this.isAlertIndexClicked = null;
    this.isDisplayedDialogBlock = false;
    this.isTwoBtnOfParkingAndAlertZoneClicked = false;
    this.setState({ isClickedParkingBtn: false, isParkingBlockDisplayed: true, isClickedAlertZoneBtn: false });
  }

  setTimeToRemoveAlertPV = (countSecConvertToTimeOut, alertKey, location, messageKeyZoneDeDanger) => {

    setTimeout(() => {
      // this.isAlertPVActivated = false;
      this.props.requestRemoveAlertPV(alertKey);
      UserService.removeAlertPV(alertKey, location)
      this.setState({ refreshToReRender: false });

    }, countSecConvertToTimeOut);
  }

  handleActivateDialogAlertPV = () => {

    // kos pich
    // this.coordinateLastPositionUser = [104.938438, 11.547509]
    // new

    // this.coordinateLastPositionUser = [104.921052, 11.546667]
    //new...
    // this.coordinateLastPositionUser = [104.908012, 11.545237]


    let location = [this.coordinateLastPositionUser[1], this.coordinateLastPositionUser[0]];
    this.isAlertPVActivated = true;
    this.coordinateAlertPV.push(this.coordinateLastPositionUser)
    UserService.registerAlertPV(this.curUser.Key, location, (alertKey, status) => {
      if (status) {
        let alertPvData = {
          alertKey: alertKey,
          create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          user_key: this.curUser.Key,
          coordinateAlertPV: this.coordinateLastPositionUser,
          location: location
          // coordinateAlertPV: [104.941195, 11.547722],
          // location: [11.547722, 104.941195]
        }
        this.props.requestRegisterAlertPV(alertPvData)
        this.setTimeToRemoveAlertPV(1200000, alertKey, location, null);
      }
    })
    this.handleCancelPopupDialogAlertPV();
  }

  setTimeToRemoveAlertZoneDeDanger = (countSecConvertToTimeOut, alertKey, location, messageKeyZoneDeDanger) => {
    setTimeout(() => {
      this.isAlertZoneDeDangerActivated = true;
      this.props.requestRemoveRegisterAlertZoneDeDanger(alertKey);
      UserService.removeAlertZoneDeDanger(alertKey, location)
      UserService.removeAlertMessagesZoneDeDanger(messageKeyZoneDeDanger)
      this.setState({ refreshToReRender: true });

    }, countSecConvertToTimeOut);
  }

  handleActivateDialogAlertZoneDanger = (data) => {
    let location = [this.coordinateLastPositionUser[1], this.coordinateLastPositionUser[0]];
    this.isAlertZoneDeDangerActivated = true;
    this.coordinateAlertZoneDeDanger.push(this.coordinateLastPositionUser);
    UserService.registerAlertZoneDeDanger(this.curUser.Key, location, (alertKey, status) => {
      if (status) {
        let alertZoneDeDanger = {
          alertKey: alertKey,
          create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          user_key: this.curUser.Key,
          coordinateAlertZoneDeDanger: this.coordinateLastPositionUser,
          location: location,
          recordedData: data
        }
        this.props.requestRegisterAlertZoneDeDanger(alertZoneDeDanger)
        this.setTimeToRemoveAlertZoneDeDanger(1200000, alertKey, location, data.key);
        this.setState({ isInsideZoneDeDangerAlert: true })
      }
    })
  }

  handleCompletedVoiceZoneDeDanger = (status, data) => {
    if (status) {
      this.handleActivateDialogAlertZoneDanger(data);
      this.handleCancelPopupDialogAlertZoneDanger();
    }
  }

  dialogAlertPV = () => {
    return (
      <View style={[internalStyles.headerOfDialog, { height: this.heightDialogScreen }]}>
        <View style={ApplicationStyles.topLine} />
        <TouchableOpacity style={{ right: 0, position: 'absolute', margin: 10 }} onPress={this.handleCancelPopupDialogAlertPV}>
          <Ionicons name='md-close-circle' style={{ color: "#3C3C3C" }} size={24} />
        </TouchableOpacity>

        <View style={{ justifyContent: 'space-around', height: "100%", flexDirection: 'column', paddingBottom: 20 }}>
          <Text style={styles.txtDescription}>
            Contrôle en cours !
                    {'\n'}
            Prévenez la communauté
                    {'\n'}
            pendant 20 min à proximité de :
                </Text>
          <Text style={[styles.txtDescription, { color: '#B360D2' }]}>{this.state.currentAddress}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <LinearGradient
              start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
              locations={[0, 0.6]}
              colors={['#C20657', '#B360D2']}
              style={internalStyles.gradientBtn}>
              <TouchableOpacity
                style={ApplicationStyles.linearGradiantButton}
                onPress={this.handleActivateDialogAlertPV}>
                <Text style={{ fontSize: 18, color: 'white' }}>
                  Alerter
                            </Text>
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity
              style={styles.btnConfirmStyle}
              onPress={this.handleCancelPopupDialogAlertPV}
            >
              <Text style={styles.txtDescription}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  dialogZoneDanger = () => {
    return (
      <View style={[internalStyles.headerOfDialog, { height: this.heightDialogScreen }]}>
        <View style={ApplicationStyles.topLine} />
        <TouchableOpacity onPress={this.handleCancelPopupDialogAlertZoneDanger} style={{ right: 0, position: 'absolute', margin: 10 }}>
          <Ionicons name='md-close-circle' style={{ color: "#3C3C3C" }} size={24} />
        </TouchableOpacity>

        <View style={{ justifyContent: 'space-around', height: "100%", flexDirection: 'column', paddingBottom: 20 }}>
          <Text style={styles.txtDescription}>
            Zone de danger !
                        {'\n'}
            Prévenez la communauté
                        {'\n'}
            pendant 20 min à proximité de :
                    </Text>
          <Text style={[styles.txtDescription, { color: '#B360D2' }]}>{this.state.currentAddress}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 20 }}>
            <RecordZoneDeDangerButton
              width={Metrics.buttons.large}
              height={Metrics.buttons.large}
              onCompletedVoiceZoneDeDanger={(status, data) => this.handleCompletedVoiceZoneDeDanger(status, data)}
              isRecordDeviceFree={true}
              recordsSource={this.state.recordsSource}
              currentLocation={this.state.currentLocation}
              user={this.props.user} />
            <TouchableOpacity
              style={styles.btnConfirmStyle}
              onPress={this.handleCancelPopupDialogAlertZoneDanger}
            >
              <Text style={styles.txtDescription}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  clickEachTypeOfAlertZone = (index) => {
    this.sizeLevelSwipe = "medium";
    this.isAlertIndexClicked = index
    this.isDisplayedDialogBlock = true;

    let { isInsideZoneAlertPv, isInsideZoneDeDangerAlert } = this.state

    if (index == 0) isInsideZoneAlertPv = true
    else isInsideZoneDeDangerAlert = true

    this.setState({ statusAlertPVDialog: true, isInsideZoneAlertPv, isInsideZoneDeDangerAlert, isParkingBlockDisplayed: false, recordsSource: ALL, on_press_title: null });
  }

  handleTwoButtonOfAlertZone = () => {

    return (
      this.typeOfAlertZone.map((eachType, index) => {
        bgColor = "#FFFFFF"
        textColor = "#B360D2"
        isPressFunction = true;
        if (index == 0 && this.isAlertPVActivated || this.state.isInsideZoneAlertPv || index == 1 && this.isAlertZoneDeDangerActivated || this.state.isInsideZoneDeDangerAlert) {
          bgColor = "#8E8E93"
          textColor = "#FFFFFF"
          functionCall = null;
          isPressFunction = false
        }
        if (this.isAlertIndexClicked != null && this.isAlertIndexClicked != index) return false;
        return (

          <Animated.View style={[MapStyles.roundButton, {
            opacity: this.state.buttonStylesAnimation, right: index == 0 ? 165 : 85, backgroundColor: bgColor, borderWidth: this.isAlertIndexClicked != null ? 4 : 0, borderColor: this.isAlertIndexClicked != null ? "#DFC0EB" : 'transparent',
            ...this.state.isParkingBlockDisplayed && !this.state.isClickedParkingBtn ?
              {
                top: this.sizeLevelSwipe == "morethan_medium" ?
                  bottomPixelMoreThanMedium
                  :
                  this.sizeLevelSwipe == "medium" ?
                    bottomPixelMedium
                    :
                    bottomPixelSmall
              }
              :
              {
                bottom: this.heightDialogScreen + 10
              },
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.00,

            elevation: 24,
          }]}>
            <TouchableOpacity onPress={isPressFunction ? () => this.clickEachTypeOfAlertZone(index) : null} >
              <Text style={{ fontSize: 10, color: textColor, textAlign: 'center' }}>
                {eachType}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )
      })
    )
  }

  handleCancelPopupParking = () => {
    this.sizeLevelSwipe = "medium"
    this.isDisplayedDialogBlock = false;
    this.displayCurrentPosition = false;
    this.isTwoBtnOfParkingAndAlertZoneClicked = false;
    this.setState({ isClickedParkingBtn: false, isParkingBlockDisplayed: true, isClickedAlertZoneBtn: false, swipeablePanelBlockChatActive: true });
  }

  handleClickingParking = () => {
    // this.sizeLevelSwipe = "medium";
    this.isDisplayUserLocationPoint = false;
    this.displayCurrentPosition = true;
    if (!this.isDisplayedDialogBlock) {
      this.isDisplayedDialogBlock = true;
      this.isTwoBtnOfParkingAndAlertZoneClicked = true;
      this.isAlertIndexClicked = null;
      this.setState({ isClickedParkingBtn: true, isParkingBlockDisplayed: true, isClickedAlertZoneBtn: false, swipeablePanelBlockChatActive: false });
    }

  }

  handleClickingAlertZoneBtn = () => {
    // this.sizeLevelSwipe = "medium";
    if (this.isAlertIndexClicked == null && !this.isDisplayedDialogBlock) {
      if (this.isToggleBtnAlertZone) {
        this.isToggleBtnAlertZone = false;
        this.isAlertIndexClicked = null;
        this.isTwoBtnOfParkingAndAlertZoneClicked = false;
        this.setState({ isClickedAlertZoneBtn: !this.state.isClickedAlertZoneBtn });
      }
      if (!this.isTwoBtnOfParkingAndAlertZoneClicked) {
        this.isToggleBtnAlertZone = true;
        this.isAlertIndexClicked = null;
        this.isTwoBtnOfParkingAndAlertZoneClicked = true;
        this.setState({ isClickedAlertZoneBtn: !this.state.isClickedAlertZoneBtn });
      }
    }

  }

  onMapPress = (event) => {
    if (event && this.state.isClickedParkingBtn) {
      const { geometry } = event
      this.isDisplayUserLocationPoint = false;
      this.displayCurrentPosition = true;
      this.handleGetAddressFromLatlon(geometry.coordinates[1], geometry.coordinates[0]);
      this.setState({ coordinateCurrentUser: geometry.coordinates });

    }
  }

  onBlockUser = () => {
    const curRecordsSource = this.state.recordsSource

    this.setState({ recordsSource: null }, () => this.setState({ recordsSource: curRecordsSource }))
  }

  handleCircleOfAlert = (title, type_circle, coordinate_circle) => {

    //alerte pv (200m) - zone de danger (800m)
    var radius = isAlertPV(type_circle) ? AppConfig.nbKmCircleAlertPV : AppConfig.nbKmCircleZoneDanger;

    var options = {
      type: 'Feature',
      units: 'kilometers',
      properties: {}
    };

    var newShape = circle(coordinate_circle, radius, options);

    if (coordinate_circle && !coordinate_circle[0] && !coordinate_circle[1]) {
      return false;
    }

    if (type_circle == ALERT_TYPES.LISTEN_PARKING || type_circle == ALERT_TYPES.ALERT_PV) {
      const start_lat_lon = {
        latitude: this.coordinateLastPositionUser[1],
        longitude: this.coordinateLastPositionUser[0],
      }
      const end_lat_lon = {
        latitude: coordinate_circle[1],
        longitude: coordinate_circle[0]
      }
      const calculate_lat_lon = haversine(start_lat_lon, end_lat_lon);

      if (Number(calculate_lat_lon) >= AppConfig.nbKmCircleAlertPV) {
        return false;
      }
    }

    return (

      <MapboxGL.RasterLayer id={`Raster_${title}`}>

        <MapboxGL.ShapeSource aboveLayerID={`Shape_${title}`} layerIndex={10} id={title} shape={newShape}>
          <MapboxGL.FillLayer
            id={'bebeep2019CircleFill' + title}
            style={mapStyles.circles}
            belowLayerID='originInnerCircle' />
        </MapboxGL.ShapeSource>

      </MapboxGL.RasterLayer>
    )
  }


  handleOnClickOnSearchIcon = () => {
    if (this.props.user && this.props.user.isPremium) {
      global.searchFromScreen = "MapScreen"
      this.props.navigation.navigate('SearchScreen')
    }
    else {
      this.setState({ isPopUpPremiumVisible: !this.state.isPopUpPremiumVisible })
    }

  }

  handleStylesParkingAndAlertButton = (type) => {
    let markingButtonStyles = {
      ...MapStyles.roundButton,
      opacity: this.state.buttonStylesAnimation,
      ...type == 'parking' ? { left: 10 } : { right: 10 },
      ...this.state.isParkingBlockDisplayed && !this.state.isClickedParkingBtn ?
        {
          top: this.sizeLevelSwipe == "morethan_medium" ?
            bottomPixelMoreThanMedium
            :
            this.sizeLevelSwipe == "medium" ?
              bottomPixelMedium
              :
              bottomPixelSmall
        }
        :
        {
          bottom: this.heightDialogScreen + 10
        }
    }
    return markingButtonStyles;
  }

  render() {
    const { coordinateCurrentUser, isPubChatSelected, isClickedParkingOrAlertZone, isClickedParkingBtn, isClickedAlertZoneBtn, isParkingBlockDisplayed } = this.state
    this.heightMapScreen = 0;
    this.heightDialogScreen = 0;

    const divideHeight = getHeight / 5;
    // 1 = 20%
    if (this.isDisplayedDialogBlock) {
      this.heightMapScreen = divideHeight * 3.3;
      this.heightDialogScreen = getHeight - this.heightMapScreen;
    } else {
      this.heightMapScreen = divideHeight * 1.7;
      this.heightDialogScreen = getHeight - this.heightMapScreen;
    }

    return (
      <View style={{ flex: 1 }}>
        {/* Start check condition to show ads for free user */}
        {this.props.user && this.props.user.isPremium ? null
          : <TouchableOpacity
            style={{ justifyContent: 'center', alignItems: 'center' }}
            onPress={() => this.onBannerPress()}
          >
            <Banner
              size={"BANNER"}
              unitId={'ca-app-pub-3940256099942544/6300978111'}
              // unitId={'ca-app-pub-7401432686200272/1559753202'}  //for real app in admob
              request={request.build()}
              onAdLoaded={() => {
              }}
              onAdFailedToLoad={(result) => {
              }}
            />
          </TouchableOpacity>
        }
        {/* End check condition to show ads for free user */}



        <UserPopUp
          // user={this.state.user}  //penh code
          user={this.state.selectedUser}
          isVisible={this.state.isUserPopUpVisible}
          onMessagePrivate={(user, chatroom) => this.handleOnPressSendPrivateChatUserPopup(user, chatroom)}
          onBlockUser={(userKey) => this.onBlockUser(userKey)}
          onClose={() => this.setState({ isUserPopUpVisible: false, selectedUser: [] })} />

        <MapboxGL.MapView
          ref={(c) => this._map = c}

          style={{ 
            height: 
            isParkingBlockDisplayed && !isClickedParkingBtn ?
              this.currentTop && this.isChanged && this.sizeLevelSwipe=="small" && this.currentTop>bottomPixelMedium
              ||
              this.currentTop && this.isChanged && this.sizeLevelSwipe=="medium" && this.currentTop>bottomPixelMedium
              ||
              this.currentTop && this.isChanged && this.sizeLevelSwipe=="morethan_medium" && this.currentTop>bottomPixelMedium
              ||
              this.currentTop && this.isChanged && this.sizeLevelSwipe=="large" && this.currentTop>bottomPixelMedium?
                this.currentTop+65+30
              :
                this.sizeLevelSwipe == "large" ?
                  bottomPixelMedium+65+30
                :this.sizeLevelSwipe == "medium" ?
                  bottomPixelMedium+65+30
                :
                this.sizeLevelSwipe == "morethan_medium" ?
                    bottomPixelMedium+65+30
                :
                  this.currentTop && bottomPixelMedium>this.currentTop?
                    bottomPixelMedium+65+30
                  :
                    bottomPixelSmall+65+30
              :
              bottomPixelSmall+65+30
          }}

          // zoomLevel={14}
          zoomLevel={this.currentTop?14:14.001}
          onPress={this.onMapPress}
          // animated={true}
          centerCoordinate={coordinateCurrentUser}
        >

          {this.renderAnnotations()}
          {
            // !this.isDisplayUserLocationPoint?
            this.displayCurrentPosition && isClickedParkingBtn || this.isParkingActivated ?
              <MapboxGL.PointAnnotation
                key="pointAnnotation"
                id="pointAnnotation"
                coordinate={coordinateCurrentUser}
              >
                <Image
                  source={Images.marker}
                  style={{
                    flex: 1,
                    width: 50,
                    height: 50,
                    borderRadius: 25
                  }} />
              </MapboxGL.PointAnnotation>
              :
              null
          }

          {/* circle */}
          {
            this.isParkingActivated ?
              this.coordinateParkingInAlert.map((coordinate_circle, indexCoor) => {
                if (!coordinate_circle) return false;
                const coordinate = [coordinate_circle.location[1], coordinate_circle.location[0]];
                return (
                  this.handleCircleOfAlert("parking" + indexCoor, ALERT_TYPES.LISTEN_PARKING, coordinate)
                )
              })
              :
              null
          }

          {   
            this.isAlertPVActivated ?
              this.coordinateAlertPV.map((eachCoorAlertPv, indexCoor) => {
                return (
                  this.handleCircleOfAlert(ALERT_TYPES.ALERT_PV + indexCoor, ALERT_TYPES.ALERT_PV, eachCoorAlertPv)
                )
              })
              :
              null
          }

          {
            // this.isAlertZoneDeDangerActivated ?
            this.coordinateAlertZoneDeDanger.map((eachCoorAlertZoneDeDanger, indexCoor) => {
              return (
                this.handleCircleOfAlert(ALERT_TYPES.ALERT_ZONE + indexCoor, ALERT_TYPES.ALERT_ZONE, eachCoorAlertZoneDeDanger)
              )
            })
            // :
            //   null
          }

          {
            // this.isListenAlertZoneDeDangerActivated ?
            this.coordinateListenAlertZoneDeDanger.map((eachCoorListenAlertZoneDeDanger, indexCoor) => {
              return (
                this.handleCircleOfAlert(ALERT_TYPES.LISTEN_ALERT_ZONE + indexCoor, ALERT_TYPES.ALERT_ZONE, eachCoorListenAlertZoneDeDanger)
              )
            })
            // :
            //   null
          }

        </MapboxGL.MapView>

        <Animated.View style={this.handleStylesParkingAndAlertButton('parking')}>
          {
            !this.statusMovingSwipe && this.sizeLevelSwipe != 'large' ?
              <TouchableOpacity onPress={this.handleClickingParking}>
                <Image source={
                  this.isParkingActivated || isClickedParkingBtn ?
                    Images.activeParking
                    : Images.parking}
                  style={{ width: 65, height: 65 }} />
              </TouchableOpacity>
              :
              null
          }
        </Animated.View>

        {
          !this.statusMovingSwipe && this.sizeLevelSwipe != 'large' ?
            isClickedAlertZoneBtn ?
              this.handleTwoButtonOfAlertZone()
              :
              null
            :
            null
        }

        <Animated.View style={this.handleStylesParkingAndAlertButton('alert')}>
          {
            !this.statusMovingSwipe && this.sizeLevelSwipe != 'large' ?
              <TouchableOpacity onPress={this.handleClickingAlertZoneBtn} >
                <Image source={

                  isClickedAlertZoneBtn ?
                    Images.activeAlertZone
                    :
                    isClickedAlertZoneBtn == false && this.isTypeOfAlertDisplayed ?
                      Images.activeAlertZone
                      :
                      Images.alertZone
                } style={{ width: 65, height: 65 }} />
              </TouchableOpacity>
              :
              null
          }
        </Animated.View>

        {
          isParkingBlockDisplayed ?
            isClickedParkingBtn ?
              this.dialogParking()
              :
              this.handleBlockChatting()
            :
            this.isAlertIndexClicked ?
              this.dialogZoneDanger()
              :
              this.dialogAlertPV()
        }
        {
          isParkingBlockDisplayed && !isClickedParkingBtn ?
            <FooterButtons chatroom={this.state.chatroom} on_press_title={this.state.on_press_title} currentLocation={this.state.currentLocation} user={this.props.user} recordsSource={this.state.recordsSource} handleEditProfile={this.handleEditProfile} handleInviteContact={this.handleInviteContact} />
            : null
        }

        <PremiumPopUp isVisible={this.state.isPopUpPremiumVisible} onVisibilityChanged={(isVisible) => this.onPremiumPopUpVisibilityChanged(isVisible)} />

      </View>

    );
  }
}

const mapStyles = MapboxGL.StyleSheet.create({
  circles: {
    visibility: 'visible',
    fillColor: '#B360D2',
    fillOpacity: 0.25
  },
});

const mapInnerStyles = StyleSheet.create({
  view: {
    width: 60,
    height: 60,
    borderColor: 'black',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
})

const internalStyles = StyleSheet.create({
  gradientBtn: {
    height: 45,
    width: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  headerOfDialog: {
    position: "absolute",
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFF'
  }
});

const mapStateToProps = (state) => {
  return {
    currentThread: state.thread.current,
    user: state.auth.user,
    userLocationParking: state.userLocationParking,
    userSettings: state.settings.userData,
    userAlerts: state.userAlerts
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    requestRegisterAlertZoneDeDanger: (alertZoneDeDangerData) => dispatch(UserAlertsActions.registerAlertZoneDeDanger(alertZoneDeDangerData)),
    requestRemoveRegisterAlertZoneDeDanger: (alertKey) => dispatch(UserAlertsActions.removeRegisterAlertZoneDeDanger(alertKey)),

    requestRemoveAlertPV: (alertKey) => dispatch(UserAlertsActions.removeRegisterAlertPv(alertKey)),
    requestRegisterAlertPV: (alertPvData) => dispatch(UserAlertsActions.registerAlertPv(alertPvData)),
    setCurrentThread: (data) => dispatch(ThreadActions.setThread(data)),
    registerLocationParking: (parkingData) => dispatch(UserLocationParkingActions.registerLocationRequest(parkingData)),
    removeLocationParking: () => dispatch(UserLocationParkingActions.removeLocationRequest())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MapScreen)

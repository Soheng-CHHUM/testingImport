import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  View, Text, BackHandler, ScrollView, Dimensions, TouchableOpacity, TextInput, StyleSheet, Button, Image
} from 'react-native';
import { connect } from 'react-redux'
// import { Actions } from 'react-native-router-flux';
import styles from './Styles/HomeScreenStyle';
import UserActions from '../Redux/UserRedux'


class HomeScreens extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      statusFlashScreen: true
    }
    global.currentScene = "HomeScreens";
  }

  handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => { },
      (error) => { },
      { enableHighAccuracy: true }
    );
  }
  _goBack = () => {
    this.props.navigation.goBack(null)
}

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressed);
    this.props.navigation.setParams({ goBack: this._goBack });
    this.handleGetCurrentLocation();
  }
  onBackButtonPressed = () => {
    return true;
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressed);
    if (this.unsubscribe) this.unsubscribe();
  }

  handleConnextion = async () => {
    // this.props.navigation.navigate('LoginScreen')
    this.props.navigation.navigate('RegisterScreen')

  }
  handleInscription = () => {
    this.props.navigation.navigate('RegisterScreen')
    // this.props.navigation.navigate('InviteContactScreen')
  }
  renderFlashScreen = () => {
    const screenHeigh = Dimensions.get('window').height;
    return <View style={styles.container}>
      <LinearGradient colors={['#b61fd1', '#bd4476', '#c2306d']} style={styles.linearGradient}>
        <View style={{ height: screenHeigh, justifyContent: 'center', alignSelf: 'center' }}>
          <View style={styles.imgStyle} >
            <Image
              style={{ width: 150, height: 150 }}
              source={require('../Images/white_logo_no_background.png')}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  }
  componentWillMount() {

    if (!this.props.loaded) return

    if (global.currentScene == "HomeScreens") {
      const user = this.props.user
      if (user && !user.isDeleted) {
        this.props.navigation.navigate('MapScreen')
      } else {
        this.setState({ statusFlashScreen: false });
      }
    }
  }
  renderHomeScreen = () => {
    const screenHeigh = Dimensions.get('window').height;
    return <View style={styles.container}>
      <LinearGradient colors={['#AE59C5', '#B23393', '#BA0F60']} style={styles.linearGradient}>
        <View style={{ height: screenHeigh, justifyContent: 'center', alignSelf: 'center' }}>
          <View style={styles.imgStyle} >
            <Image
              style={{ width: 173, height: 165 }}
              source={require('../Images/white_logo_no_background.png')}
            />
          </View>
          <View style={styles.viewTextStyle} >
            <Text style={styles.textStyle}>Communiquez dans vos trajets en voiture avec les personnes autour de vous</Text>
          </View>
          <View style={styles.bottonContainer} >
            <TouchableOpacity style={styles.touchOpacity}
              onPress={this.handleConnextion}  >
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bottonText}>Connexion</Text>
              </View>
            </TouchableOpacity>





            {/* <TouchableOpacity style={styles.touchOpacityNoColor}
              onPress={this.handleInscription}  >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', padding: 10, fontSize: 18 }}>Inscription</Text>
              </View>
            </TouchableOpacity> */}





          </View>
          <View style={{ height: 15 }} >
            <Text style={styles.bottomSmallText}>En vous inscrivant sur I'application vous étes d'accord aves les</Text>
          </View>
          <View style={{ height: 15 }} >
            <Text style={{ textAlign: 'center', color: '#B360D2', fontSize: 14, textDecorationLine: 'underline', }}>conditions d'utilisation</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.loaded) return
    if (global.currentScene == "HomeScreens") {
      const user = newProps.user
      if (user) {
        this.props.navigation.navigate('MapScreen')
        // this.props.navigation.navigate('ProfileScreen')
      } else {
        this.setState({ statusFlashScreen: false });
      }
    }
  }

  render() {

    // ({homeScreen_user_info: this.props.user})

    return (

      this.state.statusFlashScreen ?
        this.renderFlashScreen()
        :
        this.renderHomeScreen()
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    loaded: state.appState.rehydrationComplete
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreens)

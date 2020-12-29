import React, { Component } from 'react';
import { Alert, View, Text, ScrollView, BackHandler, TouchableOpacity, Platform, TextInput, StyleSheet, Image } from 'react-native';
import { Icon } from 'native-base';
import styles from './Styles/CreateAccountScreenStyle';
import { connect } from 'react-redux'
import AuthActions from '../Redux/AuthRedux'
import { Functions } from '../Themes'
import SettingsService from '../Services/Settings'
import UserService from '../Services/User'
import GeoService, { USERS } from '../Services/GeoService'

class CreateAccountScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowPassword: false,
      passwordLenghtIsBigger: false,
      username: '',
      password: '',
      email: '',
      // stringGmail: '@gmail.com',
      statusLoading: false,
      statusButton: false,
      countChar: 6,
    }

    this.currentUser = this.props.navigation.state.params.currentUser
  }
  static navigationOptions = ({ navigation }) => {
    return {
      headerStyle: {
        elevation: 0,
      },
      headerLeft: (
        <TouchableOpacity onPress={navigation.getParam('goBack')} style={{ paddingLeft: 12 }}>
          {/* <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: 'red' }} /> */}
        </TouchableOpacity>
      )
    };
  };
  _goBack = async () => {
    this.props.navigation.goBack(null)
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressed);
    this.props.navigation.setParams({ goBack: this._goBack });
  }
  onBackButtonPressed = () => {
    return true;
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressed);
    if (this.unsubscribe) this.unsubscribe();
  }
  handleShowPassword = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword
    });

  }

  handleCreate = () => {
    const { username, password } = this.state
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (username == '') {
      Alert.alert(
        'Inscription',
        "UserName is required",
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false },
      );
      // alert("UserName is required")
    }
    else {
      this.setState({ statusLoading: true });
      const Avatar = '';
      // const Email = email.toLocaleLowerCase();
      const isLogin = "phone"
      const isVisible = true
      const nbUnreadMessages = 0
      const status = 'online'
      const usernameToLower = username.toLocaleLowerCase().trim()
      const isPremium = false
      const userObj = {
        Avatar: Avatar, Name: username, isLogin: isLogin,
        isVisible: isVisible, nbUnreadMessages: nbUnreadMessages, status: status, usernameToLower: usernameToLower, isPremium: isPremium
      }
      let countRegisterRes = 0
      UserService.registerWithPhoneNumber(userObj, this.currentUser, (resUser, err) => {
        countRegisterRes += 1
        if (countRegisterRes == 1) {
          if (resUser) {
            let mergeUserInfo = { ...userObj, ...resUser, ...{Key: resUser.key} }
            let settingObject = {
              nbKmLimitZone: 5,
              invisible: false,
              bluetooth: false,
              telephone: false,
            }
            SettingsService.updateUserSetting(resUser.key, settingObject, false)
            UserService.updateUser({ Key: resUser.key, invisible: false })
            GeoService.setRadius(USERS, 5)

            this.props.setUser(mergeUserInfo)
            this.setState({ statusLoading: false });
            this.props.navigation.navigate('SelectAvataScreen')
          }
          else {
            this.setState({ statusLoading: false });
          }
        }
      })
    }



  }
  onChangeEmail = (email) => {
    // var email=email.toLocaleLowerCase()
    this.setState({
      email,
      statusButton: true
    });
  }
  onChangeUserName = (username) => {
    this.setState({
      username,
      statusButton: true
    });
  }
  onChangePassword = (password) => {
    this.setState({
      password,
      statusButton: true
    });
  }
  render() {
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        {
          Functions.loading(this.state.statusLoading)
        }
        <View style={styles.container}>
          <View style={styles.RowContainer}>
            <View>
              <Text style={styles.topTextStyle}>Votre pseudo</Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Image
                style={{ width: 30, height: 30, marginBottom: 7 }}
                source={require('../Images/Shyly_Smiling_Face_Emoji.png')}
              />
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 18, }}>Créez votre profil</Text>
          </View>
          {/* textfield username */}
          <View style={{ height: 50, marginTop: 35 }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <TextInput
                maxLength={20}
                placeholder="Pseudo"
                placeholderTextColor='##8F8F94'
                // underlineColorAndroid={'#E86BFF'}
                style={{
                  fontSize: 18,
                  height: 48, color: 'black',
                  borderBottomColor: Platform.OS == 'ios' ? 'lightgrey' : null,
                  borderBottomWidth: Platform.OS == 'ios' ? 1 : null
                }}
                onChangeText={username => { this.onChangeUserName(username) }}

              />
            </View>
          </View>
          {/* button */}
          <View style={{ marginTop: 25, marginBottom: 20 }}>
            <TouchableOpacity style={{ justifyContent: 'center', backgroundColor: this.state.statusButton ? 'purple' : '#aeb1b5', borderRadius: 15, height: 50 }}
              onPress={this.handleCreate}  >
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bottonText}>Continuer</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* <View>
            <Text style={{ textAlign: 'center', fontSize: 16 }}>Le mot de passe doit contenir au moins 6 caractères</Text>
          </View> */}

          <View style={{ height: 180, marginTop: 20, alignItems: 'center' }}>
            <Image
              style={{ width: 106, height: 101, marginBottom: 7 }}
              source={require('../Images/Color-logo-no-background.png')}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => dispatch(AuthActions.authSetUser(user)),
  }
}

export default connect(null, mapDispatchToProps)(CreateAccountScreen)

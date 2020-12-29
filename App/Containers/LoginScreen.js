import React, { Component } from 'react';
import { View, Text, ActivityIndicator, ScrollView, KeyboardAvoidingView, TouchableOpacity, Platform, Dimensions, TextInput, StyleSheet, Image, Keyboard, AsyncStorage, Alert } from 'react-native';
import { Icon, Item, Label, Input } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { Functions } from '../Themes'
import UserService from '../Services/User'
import { connect } from 'react-redux'
import AuthActions from '../Redux/AuthRedux'
import { Overlay, Button } from 'react-native-elements'

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowPassword: false,
      statusKeyboard: false,
      password: '',
      email: '',
      emailInAlert: '',
      statusLoading: false,
      overlayVisible: false,
      screenHeight: Math.round(Dimensions.get('window').height)
    }
    global.currentScene = "LoginScreen";
  }
  // static navigationOptions = {
  //     title: 'Home',
  //     headerLeft: (
  //         <TouchableOpacity onPress={navigation.getParam('goBack')} style={{ paddingLeft: 12 }}>
  //             <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#b61fd1' }} />
  //         </TouchableOpacity>
  //     ),
  //     headerStyle: {
  //         backgroundColor: '#f4511e',
  //     },
  //     headerTintColor: '#fff',
  //     headerTitleStyle: {
  //         fontWeight: 'bold',
  //     },
  // };
  static navigationOptions = ({ navigation }) => {
    return {
      // title: 'Login',
      headerStyle: {
        elevation: 0,
      },
      headerLeft: (
        <TouchableOpacity onPress={navigation.getParam('goBack')} style={{ paddingLeft: 12 }}>
          <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#B360D2' }} />
        </TouchableOpacity>
      )
    };
  };
  _goBack = () => {
    this.props.navigation.goBack(null)
  }
  componentDidMount() {
    this.props.navigation.setParams({ goBack: this._goBack });
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", this.keyboardDidHide);
  }

  keyboardDidShow = e => {
    this.setState({ statusKeyboard: true });
  };

  keyboardDidHide = e => {
    this.setState({ statusKeyboard: false });
  };

  handleShowPassword = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword
    });
  }
  handleRegister = async () => {
    this.props.navigation.navigate('RegisterScreen')
  }
  handleOnChangText = (textInputValue, type) => {
    if (type == 'email') {
      this.setState({ email: textInputValue })
    }
    else if (type == 'emailInAlert') {
      this.setState({ emailInAlert: textInputValue })
    }
    else {
      this.setState({ password: textInputValue })
    }
  }
  handleOnLogin = () => {
    const { email, password } = this.state;
    if (email && password) {
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (reg.test(email) === true) {
        this.setState({ statusLoading: true });
        UserService.loginWithEmailPassword(email, password, (user, error) => {
          if (user) {
            this.setState({ statusLoading: false });
            this.props.setUser(user)
            // this.props.navigation.navigate('ProfileScreen')
            this.props.navigation.navigate('MapScreen')
          } else {
            const codeError = error.code
            this.setState({ statusLoading: false });
            if (codeError == "auth/wrong-password") {
              Alert.alert(
                'Connexion',
                "Incorrect Password!",
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
              // alert("Incorrect Password!")
            }
            else if (codeError == 'auth/user-not-found') {
              Alert.alert(
                'Connexion',
                "Your email not found!",
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
              // alert("Your email not found!")
            } else if (codeError == 'auth/unknown') {
              Alert.alert(
                'Connexion',
                "Your authenticat unknown!",
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
              // alert(" Your authenticat unknown!")
            }
            else {
              Alert.alert(
                'Connexion',
                "It cause by your phone number please change it.",
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
              // alert("It cause by your phone number please change it.!")
            }
          }
        })
      }
      else {
        alert('Your email is invalid.')
      }
    } else {
      // alert('Email & Password is required!')
      Alert.alert(
        'Connexion',
        "Veuillez renseigner un email et/ou un mot de passe valides s'il vous plaît.",
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false },
      );
    }
  }
  handleOnForgotPassword = () => {
    this.setState({ overlayVisible: !this.state.overlayVisible })
  }
  handleOnSendEmail = () => {
    const emailInAlert = this.state.emailInAlert
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(emailInAlert) === true) {
      this.setState({ statusLoading: true });
      UserService.forgodPassword(emailInAlert)
      this.setState({ overlayVisible: !this.state.overlayVisible })
      setTimeout(() => {
        this.setState({ statusLoading: false });
      }, 3000);
    }
    else {
      alert('your email is invalid.')
    }
  }

  render() {
    const { height } = Dimensions.get('window');
    return (

      // <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
      <ScrollView style={{ backgroundColor: "white", paddingLeft: 20, paddingRight: 20, height: this.state.statusKeyboard ? '100%' : height }}>
        {
          Functions.loading(this.state.statusLoading)
        }
        <View style={{ height: 150, width: "100%" }}>
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center' }}>
            <View>
              <Text style={{ marginRight: 7, fontSize: 21, fontWeight: 'bold', color: 'black' }}>Ravis de vous revoir</Text>
            </View>
            <View>
              <Image
                style={{ width: 30, height: 30, marginBottom: 7 }}
                source={require('../Images/Shyly_Smiling_Face_Emoji.png')}
              />
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 18, }}>Connectez-vous</Text>
          </View>
        </View>
        <View>
          <TextInput
            maxLength={50}
            placeholder="Email"
            placeholderTextColor='#ACACB0'
            underlineColorAndroid={'#E0E0E0'}
            value={this.state.email.trim()}
            style={{
              fontSize: 18,
              height: 48, color: 'black',
              borderBottomColor: Platform.OS == 'ios' ? 'lightgrey' : null,
              borderBottomWidth: Platform.OS == 'ios' ? 1 : null
            }}
            onChangeText={textInputValue => { this.handleOnChangText(textInputValue, 'email') }}
          />

          <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
            <View style={{ flex: 2 }}>
              <TextInput
                secureTextEntry={!this.state.isShowPassword}
                maxLength={50}
                placeholder="Mot de passe"
                placeholderTextColor='#ACACB0'
                underlineColorAndroid={'#E0E0E0'}
                style={{
                  fontSize: 18,
                  height: 48, color: 'black',
                  borderBottomColor: Platform.OS == 'ios' ? 'lightgrey' : null,
                  borderBottomWidth: Platform.OS == 'ios' ? 1 : null
                }}
                onChangeText={textInputValue => { this.handleOnChangText(textInputValue, 'password') }}
              />
            </View>
            <View style={{ marginRight: 10, justifyContent: 'center' }}>
              <Icon onPress={this.handleShowPassword} name={this.state.isShowPassword ? "eye" : "eye-slash"} type="FontAwesome" style={{ fontSize: 16, color: 'grey' }}></Icon>
            </View>
            <View style={{ marginRight: 8, justifyContent: 'center' }}>
              <TouchableOpacity onPress={this.handleOnForgotPassword}>
                <Text style={{ fontSize: 15, color: '#C27FDA' }}>Oublié ?</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={this.handleOnLogin}>
            <View style={{ height: 50, marginTop: 20 }}>
              <LinearGradient
                start={{ x: 0.0, y: 0.25 }} end={{ x: 0.9, y: 3.0 }}
                locations={[0.2, 0.6, 0.9]}
                colors={['#BA0F60', '#B23393', '#AE59C5']}
                style={styles.linearGradient}>
                <Text style={styles.buttonText}> Connexion </Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', paddingTop: 30, paddingBottom: 30 }}>
          <Image
            style={{ width: 106, height: 101, marginBottom: 7 }}
            source={require('../Images/Color-logo-no-background.png')}
          />
        </View>
        <View style={{ justifyContent: 'center', alignSelf: 'center', paddingBottom: 30 }}>
          <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, color: 'grey' }}>Pas de compte ?<Text onPress={this.handleRegister} style={{ fontSize: 20, color: '#B360D2', fontWeight: 'bold' }}> Créer un</Text></Text>
          </TouchableOpacity>
        </View>

        {/* block resetpassword */}
        <Overlay
          isVisible={this.state.overlayVisible}
          windowBackgroundColor='rgba(0,0,0,0.4)'
          overlayBackgroundColor='white'
          onBackdropPress={() => this.setState({ overlayVisible: !this.state.overlayVisible })}
          width={Platform.OS == 'android' ? this.state.screenHeight >= 732 ? "80%" : "80%" : this.state.screenHeight >= 812 ? "80%" : "80%"} height={Platform.OS == 'android' ? this.state.screenHeight >= 732 ? "53%" : "61%" : this.state.screenHeight >= 812 ? "43%" : "58%"}
          height='24%'
          borderRadius={5}>
          <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 10, paddingRight: 10, position: 'relative' }}  >
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', paddingTop: 7 }}>Récupération de mot de passe</Text>
            </View>
            <View style={{ paddingTop: 5 }}>
              <TextInput
                maxLength={50}
                placeholder="Votre email"
                placeholderTextColor='#ACACB0'
                underlineColorAndroid={'#E0E0E0'}
                value={this.state.emailInAlert.trim()}
                style={{
                  fontSize: 18,
                  height: 48, color: 'black',
                  borderBottomColor: Platform.OS == 'ios' ? 'lightgrey' : null,
                  borderBottomWidth: Platform.OS == 'ios' ? 1 : null
                }}
                onChangeText={textInputValue => { this.handleOnChangText(textInputValue, 'emailInAlert') }}
              />
            </View>
            <View style={{ paddingTop: 35, alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={this.handleOnSendEmail}>
                <Text style={{ color: '#B360D2', fontSize: 19, fontWeight: 'bold' }}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        {/* end block reset password */}



      </ScrollView>
      // </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    borderRadius: 20
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => dispatch(AuthActions.authSetUser(user)),
  }
}

export default connect(null, mapDispatchToProps)(LoginScreen)

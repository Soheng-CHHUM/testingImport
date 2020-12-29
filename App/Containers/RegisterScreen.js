import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, Platform, TextInput, StyleSheet, Image, AsyncStorage } from 'react-native';
import { Icon, Switch } from 'native-base';
import styles from './Styles/RegisterScreenStyle'
import stylesConfirm from './Styles/ConfirmScreenStyle'
import { Functions } from '../Themes'
import firebase from 'react-native-firebase';
import UserService from '../Services/User'
import { connect } from 'react-redux'
import AuthActions from '../Redux/AuthRedux'
class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      code: '+33',
      user: null,
      message: '',
      codeInput: '',
      phoneNumber: '',
      confirmResult: null,
      status: false,
      statusLoading: false,
      statusbotton: false,
      statusConfirm: false,
      statusCodeSent: false
    };
    global.contactIsSynchroniser = false
    global.phoneNumber = ''
  }
  static navigationOptions = ({ navigation }) => {
    return {
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
  signIn = () => {
    var { phoneNumber, code, status } = this.state;
    if (phoneNumber && phoneNumber.length <= 9) {
      this.setState({ statusLoading: true });
      global.contactIsSynchroniser = status
      phoneNumberConcat = code.concat(phoneNumber)
      global.phoneNumber = phoneNumberConcat
      // firebase.auth().verifyPhoneNumber(phoneNumberConcat)
      firebase.auth().signInWithPhoneNumber(phoneNumberConcat)
        .then(confirmResult => {
          this.setState({ confirmResult, message: 'Code has been sent!', statusLoading: false, statusCodeSent: true })
        })
        .catch(error => {
          this.setState({ statusLoading: false });
          const codeError = error.code
          if (codeError == "auth/invalid-phone-number") {
            alert("Numéro de téléphone invalide!")
          }
          else if (codeError == 'auth/unknown') {
            alert("Désolé, une erreur s'est produite. Veuillez réessayer s'il vous plaît.")
          }
          else {
            alert("Veuillez vérifier votre numéro de téléphone à nouveau.!")
          }
          this.setState({ message: `Sign In With Phone Number Error: ${error.message}` })
        }
        );
    }
    else {
      if (phoneNumber.length > 9) {
        alert("Votre numéro de téléphone doit contenir 9 chiffres, n'incluez pas le 0 au début.")
      }
      else {
        alert("Votre numéro de téléphone est requis.")
        this.setState({ statusLoading: false })
      }
    }

  };
  confirmCode = () => {
    const { codeInput, confirmResult } = this.state;
    this.setState({ statusLoading: true });
    if (confirmResult && codeInput.length) {
      confirmResult.confirm(codeInput)
        .then((user) => {
          UserService.validateAccIsExistingOrNot(user.uid, (statusValidate, existingUser) => {
            if (statusValidate) {
              let mergeUserInfo = { ...existingUser, ...{ Key: existingUser.key } }
              this.props.setUser(mergeUserInfo);
              this.setState({ statusLoading: false });
              setTimeout(() => {
                this.props.navigation.navigate('MapScreen')
              }, 3000)
            } else {
              this.setState({ statusLoading: false });
              this.props.navigation.navigate('CreateAccountScreen', { currentUser: user })
            }
          })
        })
        .catch(error => {
          if (error.code == "auth/invalid-verification-code") {
            alert("Code incorrect s'il vous plaît vérifier à nouveau")
          }
          this.setState({ statusLoading: false })
        });
    }
    else {
      alert(" Vérifiez le code requis!")
      this.setState({ statusLoading: false })

    }
  };
  signOut = () => {
    firebase.auth().signOut();
  }
  onChangeCode = (code) => {
    this.setState({ code })
  }
  onControlChange = () => {
    return this.setState({
      status: !this.state.status
    });
  }

  componentDidMount() {
    this.props.navigation.setParams({ goBack: this._goBack });
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user.toJSON() });
        UserService.validateAccIsExistingOrNot(user.uid, (statusValidate, existingUser) => {
          if (statusValidate) {
            let mergeUserInfo = { ...existingUser, ...{ Key: existingUser.key } }
            this.props.setUser(mergeUserInfo);
            this.setState({ statusLoading: false });
            setTimeout(() => {
              this.props.navigation.navigate('MapScreen')
            }, 5000)
          } else {
            this.setState({ statusLoading: false });
            setTimeout(() => {
              this.props.navigation.navigate('CreateAccountScreen', { currentUser: user })
            }, 2000)
          }
        })
      } else {
        // User has been signed out, reset the state
        this.setState({
          user: null,
          message: '',
          codeInput: '',
          phoneNumber: '',
          confirmResult: null,
        });
      }
    });
  }
  componentWillMount = () => {
    firebase.auth().signOut();

  }
  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }
  renderPhoneNumberInput = () => {
    const { phoneNumber } = this.state;
    return (
      <ScrollView style={{ backgroundColor: "white", paddingLeft: 20, paddingRight: 20, height: '100%' }}>
        {/* <View style={styles.container}> */}
        <View>
          <Text style={styles.textStyle}>Votre numéro de portable</Text>
        </View>
        <View style={styles.textContainer}>
          <View>
            <Text style={{ fontSize: 15 }}>Ne sera pas visible aux utilisateurs</Text>
          </View>
          <View>
            <Image
              style={{ width: 20, height: 20, marginLeft: 5 }}
              source={require('../Images/nerd-face-microsoft.png')}
            />
          </View>
        </View>
        {/* phone number input */}
        <View style={styles.textInputContainer}>
          <View style={styles.subTextInputContainer} >
            <View style={{ width: 60 }}>
              <TextInput
                style={styles.textInputStyle}
                maxLength={4}
                defaultValue={this.state.code}
                ref="code"
                keyboardType={'phone-pad'}
                autoCorrect={false}
                onChangeText={code => { this.onChangeCode(code) }}
                underlineColorAndroid={'#B360D2'}
                onSubmitEditing={() => this.focusNextField('3')}
              />
            </View>
            <View style={{ flex: 5 }}>
              <TextInput
                style={{ fontSize: 18 }}
                placeholder={'Votre numéro'}
                placeholderTextColor='#D0D0D3'
                maxLength={9}
                ref="phone"
                keyboardType={'numeric'}
                autoCorrect={false}
                underlineColorAndroid={'#B360D2'}
                value={phoneNumber}
                onChangeText={value => this.setState({ phoneNumber: value, statusbotton: true })}
              // onChangeText={phoneNumber => { this.onChange(phoneNumber) }}
              />
            </View>
          </View>
        </View>
        {/* switch button */}
        {/* <View style={styles.switchBottonContainer}>
          <View>
            <Text style={{ fontSize: 20 }}>Synchroniser les contacts</Text>
          </View>
          <View>
            <Switch
              onValueChange={this.onControlChange}
              thumbColor="white"
              onTintColor={this.state.status ? "#B360D2" : ''}
              value={this.state.status}
            />
          </View>

        </View> */}
        {/* button */}
        <View style={{ marginTop: 25 }}>
          <TouchableOpacity style={{ justifyContent: 'center', backgroundColor: this.state.statusbotton ? 'purple' : '#CCCCCC', borderRadius: 15 }}
            onPress={this.signIn}  >
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.textBottonStyle}>Continuer</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* </View> */}
      </ScrollView>
    );
  }
  renderMessage() {
    const { message } = this.state;

    if (!message.length) return null;

    return (
      <Text style={{ padding: 5, backgroundColor: '#000', color: '#fff' }}>{message}</Text>
    );
  }
  handleOnResendCode = () => {
    this.setState({ statusLoading: true });
    firebase.auth().signInWithPhoneNumber(global.phoneNumber, true)
      .then(confirmResult => {
        this.setState({ confirmResult, message: 'Code has been sent!', statusLoading: false })
      })
      .catch(error => {
        this.setState({ statusLoading: false });
        const codeError = error.code
        if (codeError == "auth/invalid-phone-number") {
          alert("Numéro de téléphone invalide!")
        }
        else if (codeError == 'auth/unknown') {
          alert("Désolé, une erreur s'est produite. Veuillez réessayer s'il vous plaît.")
        }
        else {
          alert("Veuillez vérifier votre numéro de téléphone à nouveau.!")
        }
        this.setState({ message: `Sign In With Phone Number Error: ${error.message}` })
      }
      );
  }
  renderVerificationCodeInput = () => {
    const { codeInput } = this.state;
    return (
      <ScrollView style={{ backgroundColor: "white", paddingLeft: 20, paddingRight: 20, height: '100%' }}>
        <View style={stylesConfirm.container}>
          <View>
            <Text style={styles.textStyle}>Confirmez votre portable</Text>
          </View>
          <View style={stylesConfirm.textContainer}>
            <View>
              <Text style={{ fontSize: 18 }}>Nous vous avons envoyé un code de confirmation par SMS</Text>
            </View>
          </View>
          {/* ConfirmCode*/}
          <View style={stylesConfirm.textInputContainer}>
            <TextInput
              style={{ textAlign: 'center', fontSize: 27 }}
              autoFocus
              placeholder={'Code'}
              maxLength={6}
              placeholderTextColor='#D0D0D3'
              value={codeInput}
              keyboardType={'numeric'}
              autoCorrect={false}
              underlineColorAndroid={'#B360D2'}
              onChangeText={value => this.setState({ codeInput: value, statusConfirm: true })}
            // onChangeText={smsCode => { this.onChange(smsCode) }}
            />
          </View>
          <View style={{ height: 15, marginTop: 5 }} >
            <TouchableOpacity onPress={this.handleOnResendCode}>
              <Text style={{ textAlign: 'center', color: '#E86BFF', fontSize: 14, textDecorationLine: 'underline', }}>Je n'ai pas reçu mon code</Text>
            </TouchableOpacity>
          </View>
          {/* button */}
          <View style={{ marginTop: 25 }}>
            <TouchableOpacity style={{ justifyContent: 'center', backgroundColor: this.state.statusConfirm ? 'purple' : '#CCCCCC', borderRadius: 15 }}
              onPress={this.confirmCode}  >
              <View style={{ alignItems: 'center' }}>
                <Text style={stylesConfirm.textBottonStyle}>Continuer</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

    );
  }
  render() {
    const { user, confirmResult, statusCodeSent } = this.state;
    return (
      <View style={{ flex: 1 }}>
        {
          Functions.loading(this.state.statusLoading)
        }
        {
          statusCodeSent ?
            this.renderVerificationCodeInput()
            :
            this.renderPhoneNumberInput()
        }
      </View>
    );
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => dispatch(AuthActions.authSetUser(user)),
  }
}

export default connect(null, mapDispatchToProps)(RegisterScreen)

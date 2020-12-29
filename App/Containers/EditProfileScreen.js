import React, { Component } from 'react';
import { Alert, View, Text, ScrollView, Dimensions, TouchableOpacity, FlatList, Image, Platform, Keyboard, KeyboardAvoidingView, AsyncStorage, ActivityIndicator } from 'react-native';
import { Icon, Label, Item, Input } from 'native-base';
import { Overlay, Button } from 'react-native-elements'
import UserService from '../Services/User'
import GroupService from '../Services/GroupService'
import { connect } from 'react-redux'
import AuthActions from '../Redux/AuthRedux'
import firebase from 'react-native-firebase';
import { Functions } from '../Themes'
import { NavigationActions, StackActions } from 'react-navigation'

const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

let interstitial = null

const numColumns = 3;
class EditProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarList: [],
      overlayVisible: false,
      statusKeyboard: false,
      userData: null,
      isLoadingMore: false,
      statusLoading: false,
    }
    this.page_no = 1;
    this.isPagniationEnded = false;
    this.labelInput = "";
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
      ),
      title: 'Modifier mon profil'
    };
  };
  _goBack = () => {
    this.props.navigation.goBack(null)
  }
  keyboardDidShow = e => {
    this.setState({ statusKeyboard: true });
  };

  keyboardDidHide = e => {
    this.setState({ statusKeyboard: false });
  };
  componentDidMount() {
    this.props.navigation.setParams({ goBack: this._goBack });
    this.interstitialAd();
    interstitial.show();
    // setTimeout(() => {
    //   this.showAdd()
    // }, 5000);
  }
  componentWillMount() {
    let { userData } = this.state
    if (this.props.user) {
      userData = this.props.user;
    }
    this.setState({ userData });
    this.keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", this.keyboardDidHide);
    // UserService.getAvatar((resAvatar) => {
    //     this.setState({ avatarList: resAvatar });
    // });
    this.handleGetAvatarPerPage(this.page_no)
  }

  interstitialAd() {
    interstitial = firebase.admob().interstitial('ca-app-pub-3940256099942544/1033173712');
    interstitial.on('onAdLoaded', () => { })
    interstitial.on('onAdOpened', () => { })
    interstitial.on('onAdClosed', () => {
      this.interstitialAd();
    })
    interstitial.on('onAdFailedToLoad', (err) => {
    })
    interstitial.loadAd(request.build());
  }
  handleGetAvatarPerPage = (page_no) => {
    UserService.getAvatar(page_no, (resAvatar) => {
      if (resAvatar.length != this.state.avatarList.length) {
        this.isPagniationEnded = false;
      } else {
        this.isPagniationEnded = true;
      }
      this.setState({ avatarList: [...resAvatar], isLoadingMore: false });
    });
  }

  loadMoreAvatar = () => {
    if (!this.isPagniationEnded) {
      this.page_no += 1;
      this.setState({ isLoadingMore: true });
      this.handleGetAvatarPerPage(this.page_no);
    }
  }

  handleEngChangeTextInput = (eachLabel) => {
    let { userData } = this.state
    UserService.updateUser(userData)
    this.props.setUser(userData)
    if (this.labelInput == "Email") {
      UserService.updateEmail(userData.Email)
    }
  }

  handleOnChangeTextInput = (label, textValue) => {
    let { userData } = this.state
    let newUserData = { ...userData, ...{ [label]: textValue } }
    this.labelInput = label;
    this.setState({ userData: newUserData });
    // UserService.updateUser(newUserData)
    // this.props.setUser(newUserData)
    // if(label=='Email'){
    //   UserService.updateEmail(textValue)
    // }
  }
  handleOnChagneAvatar = () => {
    this.setState({ overlayVisible: !this.state.overlayVisible })
  }
  handleConfirmLogoutAcc = () => {
    this.setState({ statusLoading: true });
    firebase.auth().signOut()
    AsyncStorage.removeItem('persist:primary');
    setTimeout(() => {
      this.setState({ statusLoading: false });
      this.props.resetUser()
      // this.props.navigation.navigate('HomeScreens')
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'HomeScreens' })],
      });
      this.props.navigation.dispatch(resetAction);
    }, 2000)
  }
  handleOnDeconnexion = () => {
    Alert.alert(
      'Profil',
      ' Voulez-vous vraiment vous déconnecter?',
      [
        { text: 'Non', onPress: () => console.log('Cancel'), style: 'cancel' },
        {
          text: 'Oui', onPress: () => this.handleConfirmLogoutAcc()
        },
        { cancelable: false },
      ],
    );
  }

  handleConfirmDeletingAcc = () => {
    this.setState({ statusLoading: true });
    let { userData } = this.state
    let newUserData = { ...userData, ...{ isDeleted: true } }
    GroupService.deleteUserDeleteGroup(userData.Key)
    UserService.deleteUser(newUserData)
    // - delete user
    // - delete setting
    this.props.resetUser()

    AsyncStorage.removeItem('persist:primary');
    setTimeout(() => {
      UserService.deleteAccount();
      firebase.auth().signOut()
      this.setState({ statusLoading: false });
      this.props.resetUser()
      // this.props.navigation.navigate('HomeScreens')
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'HomeScreens' })],
      });
      this.props.navigation.dispatch(resetAction);
    }, 3000)
  }

  handleOnSupprimmer = () => {
    Alert.alert(
      'Profil',
      'Voulez-vous vraiment supprimer votre compte ?',
      [
        { text: 'Non', onPress: () => console.log('Cancel'), style: 'cancel' },
        {
          text: 'Oui', onPress: () => this.handleConfirmDeletingAcc()
        },
        { cancelable: false },
      ],
    );


  }
  renderItem = ({ item, index }) => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            margin: 1,
            height: Dimensions.get('window').width / numColumns,
          }}>
            <TouchableOpacity onPress={() => this.handleImageClick(item)}>
              <Image
                style={{
                  width: 90, height: 90, borderRadius: 50,
                  borderColor: 'grey', borderWidth: 0.5
                }}
                source={{ uri: item }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  handleImageClick = (item) => {
    let { userData } = this.state
    let newUserData = { ...userData, ...{ Avatar: item } }
    this.setState({ userData: newUserData });
    UserService.updateUser(newUserData)
    this.props.setUser(newUserData)
    this.setState({ overlayVisible: !this.state.overlayVisible })
  };
  showAdd = () => {
    interstitial.show()
  }
  render() {
    const { height } = Dimensions.get('window');
    const getLabelArr = Object.keys(this.state.userData)
    // const keyLabelArr = getLabelArr ? getLabelArr : [];
    const keyLabelArr = ['Name', 'Phone'];
    return (

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
        {
          Functions.loading(this.state.statusLoading)
        }
        <ScrollView style={{ backgroundColor: "white", paddingLeft: 20, paddingRight: 20, height: this.state.statusKeyboard ? '100%' : height }}>
          <View style={{ flex: 1 }}>
            <View style={{ paddingLeft: 20, paddingRight: 10 }}>
              {/* <View style={{ backgroundColor: 'white', width: 100, marginTop: 10, borderRadius: 15, paddingBottom: 10, paddingLeft: 10 }}>
                                <Image style={{ width: 90, height: 100, borderColor: 'white', padding: 15 }}
                                    source={require('../Images/profile.png')}
                                />
                            </View> */}
              <View style={{ paddingTop: 10 }}>
                <Image style={{ width: 100, height: 100, borderColor: 'white', padding: 15, alignItems: 'center', borderRadius: 10 }}
                  source={{ uri: this.state.userData ? this.state.userData.Avatar : 'https://citizenbags.net/images/default.png' }}
                />
              </View>
              <TouchableOpacity onPress={this.handleOnChagneAvatar}>
                <View>
                  <Text style={{ color: '#B360D2', fontSize: 15, paddingTop: 10 }}>Changer mon avatar</Text>
                </View>
              </TouchableOpacity>
              <View style={{ height: 10 }}></View>
              <View>
                {
                  keyLabelArr.map((eachLabel) => {
                    return (<View>
                      <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{ flex: 2 }}>
                          <Item floatingLabel>
                            <Label>{eachLabel == 'Name' ? 'Pseudo' : eachLabel == 'Phone' ? 'Portable' : eachLabel}</Label>
                            <Input
                              autoCapitalize='none'
                              autoCorrect={false}
                              value={this.state.userData[eachLabel]}
                              onEndEditing={(eachLabel) => this.handleEngChangeTextInput(eachLabel)}
                              onChangeText={(textValue) => this.handleOnChangeTextInput(eachLabel, textValue)}
                            />
                          </Item>
                        </View>
                        <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                          <TouchableOpacity>
                            <Icon style={{ fontSize: 30, color: '#B360D2', fontWeight: 'bold', paddingBottom: 6 }} name='pencil' type='EvilIcons' />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    );
                  })
                }
              </View>
              {/* botton Deconnextion */}
              <View style={{ justifyContent: 'flex-end', height: 60 }}>
                <TouchableOpacity onPress={this.handleOnDeconnexion}>
                  <Text style={{ textAlign: 'center', fontSize: 18, color: '#8F8F94' }}>Déconnexion</Text>
                </TouchableOpacity>
              </View>
              {/* Supprimer */}
              <View style={{ justifyContent: 'flex-end', height: 60 }}>
                <TouchableOpacity onPress={this.handleOnSupprimmer}>
                  <Text style={{ textAlign: 'center', fontSize: 18, color: '#EB3264' }}>Supprimer mon compte</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Overlay
            isVisible={this.state.overlayVisible}
            windowBackgroundColor='rgba(0,0,0,0.4)'
            overlayBackgroundColor='white'
            onBackdropPress={() => this.setState({ overlayVisible: !this.state.overlayVisible })}
            width='90%'
            height='90%'
            borderRadius={5}>
            <View style={{ flex: 1, flexDirection: 'column', width: '100%', height: '100%', position: 'relative' }}  >
              <View style={{ flex: 1, backgroundColor: 'orange' }}>
                <FlatList
                  data={this.state.avatarList}
                  style={{ flex: 1, backgroundColor: 'white' }}
                  renderItem={this.renderItem}
                  numColumns={3}
                  keyExtractor={(item, index) => index.toString()}
                  onEndReached={this.loadMoreAvatar}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() => {
                    return (
                      this.state.isLoadingMore ?
                        <View style={{ alignItems: 'center', height: 70 }}>
                          <ActivityIndicator size="large" color='#648CB4' style={{ justifyContent: 'center', alignItems: 'center' }} />
                        </View>
                        : null
                    );
                  }}
                />
              </View>
            </View>
          </Overlay>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => dispatch(AuthActions.authSetUser(user)),
    resetUser: () => dispatch(AuthActions.authReset()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfileScreen)


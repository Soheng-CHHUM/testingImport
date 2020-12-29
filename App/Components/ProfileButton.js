import React, { Component } from 'react'
import { Switch, View, Text, TouchableOpacity, Platform, Dimensions, TextInput, StyleSheet, Image, Keyboard, PermissionsAndroid } from 'react-native';
import { Icon, Footer, Container, Content } from 'native-base';
// import styles from './Styles/ProfileScreenStyle'
import LinearGradient from 'react-native-linear-gradient';
import Slider from 'react-native-slider'
import SettingsService from '../Services/Settings'
import UserService from '../Services/User'
import GeoService, { USERS } from '../Services/GeoService'
import { connect } from 'react-redux'
import Translator from '../Translations/Translator'
import Images from '../Themes/Images'
import stylesButton from './Styles/ProfileButtonStyle'
import { withNavigation } from 'react-navigation'
import styles from '../Containers/Styles/ChatScreenStyle'
import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog';
import Ionicons from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types'
import Share from 'react-native-share';

class ProfileButton extends Component {
  // // Prop type warnings
  // static propTypes = {
  //   someProperty: PropTypes.object,
  //   someSetting: PropTypes.bool.isRequired,
  // }
  //
  // // Defaults for props
  // static defaultProps = {
  //   someSetting: false
  // }


  static propTypes = {
    onPressEditProfile: PropTypes.func.isRequired,
    onPressInviteContact: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      layoutWidth: 0,
      refreshState: '',
      premiumAnimationDialogBtnProfile: false,
    }
    this.statusInvisible = false;
    this.statusTelephone = false;
    this.statusBluetooth = false;
    this.value = 5;

    if (props.userSettings) this.value = props.userSettings.nbKmLimitZone

    this.isSettingExisting = false;
    this.userInfo = '';
    global.currentScene = "ProfileButton";
  }
  handleOnProfile = () => {
    this.setState({ premiumAnimationDialogBtnProfile: true });
  }

  handleCloseDialogProfile = () => {
    this.setState({ premiumAnimationDialogBtnProfile: false });
    this.props.onPressEditProfile();
  }


  handleToInviteContactScreen = () => {
    // this.setState({ premiumAnimationDialogBtnProfile: false });
    // this.props.onPressInviteContact();
    const shareOptions = {
      title: 'BeBeep Share',
      message: "Utilise BeBeep ! Pour communiquer en voiture avec les gens autour de toi !",
      url: 'https://radio-screen.com/?lang=en',
      social: Share.Social.WHATSAPP,
      whatsAppNumber: "+85581363135"  // country code + phone number(currently only works on Android)
    };
    Share.open(shareOptions);
  }



  onControlChange = (varNameStatus) => {
    this[varNameStatus] = !this[varNameStatus]
    this.handleUpdateSettingData();
    this.setState({ refreshState: '' });
  }
  componentWillReceiveProps(newProps) {
    this.userInfo = newProps.user
    if (newProps.userSettings) this.value = newProps.userSettings.nbKmLimitZone
  }
  componentDidMount=()=>{
    this.userInfo = this.props.user
  }
  handleUpdateSettingData = () => {
    let settingObject = {
      nbKmLimitZone: this.value,
      invisible: this.statusInvisible,
      bluetooth: this.statusBluetooth,
      telephone: this.statusTelephone,
    }
    SettingsService.updateUserSetting(this.userInfo.key, settingObject, this.isSettingExisting)
    UserService.updateUser({ Key: this.userInfo.key, invisible: this.statusInvisible })
    this.isSettingExisting = true;
    GeoService.setRadius(USERS, this.value)
  }


  handleOnKilometChange = (value) => {
    this.value = value;
    this.setState({ refreshState: '' })
  }
  handleSlideKmCompleted = () => {
    this.handleUpdateSettingData()
  }

  onLayout = event => {
    this.setState({layoutWidth: event.nativeEvent.layout.width});
  }

  render() {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const maxSlideValue = 20;
    // const divideWidth = (screenWidth / maxSlideValue);
    // const remainingWidth = (maxSlideValue - divideWidth) * 20 + 20 + 40;
    // const calProgress = (screenWidth / maxSlideValue) * this.value;
    // const minusLeftPixel = (remainingWidth / maxSlideValue) * this.value;
    const calculateProgressWithLayoutWidth = this.state.layoutWidth * (0.1 * this.value)+this.value

    return (
      <View style={stylesButton.container} onLayout={this.onLayout}>
        <TouchableOpacity onPress={this.handleOnProfile}>
          <Image source={Images.icProfile} style={[stylesButton.image, { marginBottom: 2 }]} resizeMode='contain' />
          <Text style={stylesButton.text}>{Translator.t('common.my_profile')}</Text>
        </TouchableOpacity>
        {/* --------Premium Dialog-------- */}
        <Dialog
          onDismiss={() => {
            this.setState({ premiumAnimationDialogBtnProfile: false });
          }}
          onTouchOutside={() => {
            this.setState({ premiumAnimationDialogBtnProfile: false });
          }}
          width={Dimensions.get('window').width}
          visible={this.state.premiumAnimationDialogBtnProfile}
          dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
          dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: 'black', borderTopEndRadius: 30, borderTopLeftRadius: 30 }}             >
          <View />

          {/* style={ApplicationStyles.topLine} */}


          <DialogContent style={{ justifyContent: 'center', marginTop: 10 }}>
            <Container style={{ height: screenHeight - 100, backgroundColor: 'black', position: 'relative' }}>
              <Content>
                <TouchableOpacity
                  style={{ right: 0, position: 'absolute', margin: 10, }}
                  onPress={() => { this.setState({ premiumAnimationDialogBtnProfile: false }) }}
                >
                  <Ionicons name='md-close-circle' size={35} color='grey' />
                </TouchableOpacity>
                <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <View>
                    {/* start block profile */}
                    <View style={{ height: 160 }}>
                      <View style={{ paddingTop: 10 }}>
                        <Image style={{ width: 100, height: 100, borderColor: 'white', padding: 15, alignItems: 'center', borderRadius: 10 }}
                          source={{ uri: this.userInfo ? this.userInfo.Avatar : "https://citizenbags.net/images/default.png" }}
                        />
                      </View>
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{this.userInfo ? this.userInfo.Name : ''}</Text>
                      </View>
                    </View>
                    {/* end block profile */}
                    {/* start block Modifier */}
                    <View style={{ height: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',paddingBottom:6 }}>
                      <TouchableOpacity onPress={this.handleCloseDialogProfile} >
                        <View style={{ height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View>
                            <Icon style={{ fontSize: 25, color: '#B360D2', fontWeight: 'bold' }} name='pencil' type='EvilIcons' />
                          </View>
                          <View>
                            <Text style={{ fontSize: 15, color: '#B360D2', fontWeight: 'bold' }}>Modifier mon profil</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{ height: 70, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Icon style={{ fontSize: 26, color: '#B360D2', fontWeight: 'bold' }} name='right' type='AntDesign' />
                        </View>
                      </TouchableOpacity>
                    </View>
                    {/* end block Modifier */}
                    {/* draw transparent line */}
                    <View style={{ height: 15, marginBottom: 10, borderBottomColor: '#282829', borderBottomWidth: 1.5 }} />
                    {/*start block invisible  */}
                    <View style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold',paddingTop:15,paddingBottom:15}}>Devenir invisible</Text>
                      </View>
                      <View>
                        <Switch
                          thumbColor="white"
                          trackColor={{ true: '#B360D2', false: 'grey' }}
                          onValueChange={() => this.onControlChange("statusInvisible")}
                          value={this.statusInvisible}
                        />
                      </View>
                    </View>
                    {/*end block invisible  */}
                    {/* draw transparent line */}
                    <View style={{ height: 15, marginBottom: 10, borderBottomColor: '#282829', borderBottomWidth: 1.5 }} />
                    <View>
                      <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>Périmètre des messages </Text>
                    </View>
                    {/* Block kilometer */}
                    <View style={{ height: 60, width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.sliderContainer}>
                        <Text style={{ color: "#B360D2", fontSize: 15, left: calculateProgressWithLayoutWidth}}>{this.value} km</Text>
                        <Slider
                          minimumValue={1}
                          maximumValue={maxSlideValue}
                          step={1}
                          onSlidingComplete={this.handleSlideKmCompleted}
                          value={this.value}
                          style={{ width: screenWidth - 60 }}
                          onValueChange={value => this.handleOnKilometChange(value)}
                          // onValueChange={value => this.setState({ value })}
                          trackStyle={{ height: 10, borderRadius: 50, backgroundColor: 'white', shadowRadius: 1 }}
                          thumbStyle={{ width: 20, height: 20, backgroundColor: 'white', borderColor: 'white', borderWidth: 1, borderRadius: 50 }}
                          minimumTrackTintColor={"#B360D2"}
                        />
                      </View>
                    </View>
                    {/* draw transparent line */}
                    <View style={{ height: 15, marginBottom: 10, borderBottomColor: '#282829', borderBottomWidth: 1.5 }} />
                    <View>
                      <Text style={{ marginBottom: 10, fontSize: 19, color: 'white', fontWeight: 'bold' }}>Son des messages</Text>
                    </View>
                    {/* block telephone  */}
                    <View style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: 18, color: 'white' }}>Haut parleur du téléphone</Text>
                      </View>
                      <View>
                        <Switch
                          thumbColor="white"
                          trackColor={{ true: '#B360D2', false: 'grey' }}
                          onValueChange={() => this.onControlChange("statusTelephone")}
                          value={this.statusTelephone}
                        />
                      </View>
                    </View>
                    {/* block Bluetooth  */}
                    <View style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: 18, color: 'white' }}>Connection Bluetooth</Text>
                      </View>
                      <View>
                        <Switch
                          thumbColor="white"
                          trackColor={{ true: '#B360D2', false: 'grey' }}
                          onValueChange={() => this.onControlChange("statusBluetooth")}
                          value={this.statusBluetooth}
                        />
                      </View>
                    </View>
                    {/* draw transparent line */}
                    <View style={{ height: 15, marginBottom: 10, borderBottomColor: '#282829', borderBottomWidth: 1.5 }} />
                    {/* block propos de bebeep  */}
                    <View style={{ height: 40, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',paddingTop:20 }}>
                      <TouchableOpacity>
                        <View>
                          <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>A propos de BeBeep</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View>
                          <Icon style={{ fontSize: 26, color: 'grey', fontWeight: 'bold' }} name='right' type='AntDesign' />
                        </View>
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>

              </Content>
            </Container>


            {/* footer */}
            <View style={{ flex: 1, justifyContent: 'flex-end', position: 'absolute', bottom: 0, right: 0, left: 0 }}>
              <LinearGradient
                start={{ x: 0.0, y: 0.2 }} end={{ x: 0.5, y: 3.9 }}
                locations={[0, 0.5, 0.9]}
                colors={['#AE59C5', '#B23393', '#BA0F60']}
                style={styles.linearGradient}>
                <TouchableOpacity onPress={this.handleToInviteContactScreen}>
                  <View style={{ height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                    <TouchableOpacity onPress={this.handleToInviteContactScreen}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>Inviter des amis à utiliser</Text>
                      </View>
                    </TouchableOpacity>

                    <View>
                      <Image style={{ width: 90, height: 40, borderColor: 'white', marginTop: 10 }}
                        source={require('../Images/bebeeplogo.png')}
                      />
                    </View>
                    <TouchableOpacity>
                      <View>
                        <Icon style={{ fontSize: 26, color: 'grey', fontWeight: 'bold' }} name='right' type='AntDesign' />
                      </View>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </View>
            {/* Endfooter */}

          </DialogContent>
        </Dialog>
        {/* --------------Welcome Dialog-------------  */}

      </View>



    )
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    userSettings: state.settings.userData
  }
}
export default connect(mapStateToProps, null)(ProfileButton)

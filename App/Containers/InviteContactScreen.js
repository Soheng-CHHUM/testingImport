import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, KeyboardAvoidingView, TouchableOpacity, Platform, Dimensions, TextInput, StyleSheet, Image, Keyboard, PermissionsAndroid } from 'react-native';
import { Icon, Item, Label, Input } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import styles from './Styles/AdviteContactScreenStyle';
import User from '../Services/User'
import _ from 'lodash'
import Contacts from 'react-native-contacts';
import ApplicationStyles from '../Themes/ApplicationStyles'
import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Share from 'react-native-share';
import stylesContainer from './Styles/FindFriendsScreenStyle'
import DoneButton from '../Components/DoneButton'


export default class InviteContactScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusKeyboard: false,
      usersData: [],
      usersDataFilter: [],
      contactsData: [],
      contactDataFilter: [],
      contactDialog: false
    }
    this.isFiltered = false;
    this.fetchingContact = false;
  }
  static navigationOptions = ({ navigation }) => {
    return {
      headerStyle: {
        elevation: 0,
      },

      headerLeft: (
        global.currentScene == "SelectAvataScreen" ? '' :
          <TouchableOpacity onPress={navigation.getParam('goBack')} style={{ paddingLeft: 12 }}>
            <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#B360D2' }} />
          </TouchableOpacity>
      ),

      headerRight: (
        <TouchableOpacity onPress={() => navigation.navigate('MapScreen')} style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 18, color: '#8F8F94' }}>Passer</Text>
        </TouchableOpacity>
      ),
    };
  };
  _goBack = () => {
    this.props.navigation.goBack(null)
  }
  handleOnBottonCestFail = () => {
    this.props.navigation.navigate('MapScreen')
  }
  componentDidMount() {
    this.props.navigation.setParams({ goBack: this._goBack });
  }
  componentWillMount() {
    this.setState({
      contactDialog: true,
    });
    if (Platform.OS === 'ios') {
      Contacts.getAll((err, contactsData) => {
        if (err) {
          throw err;
        }
        // contacts returned
        this.fetchingContact = true;
        this.setState({ contactsData })
      })
    } else if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts',
          message: 'This app would like to view your contacts.'
        }
      ).then(() => {
        Contacts.getAll((err, contactsData) => {
          if (err === 'denied') {
            // error
          } else {
            contactsData.map(item => {
              //item.displayName
            })
            // contacts returned in Array
            this.fetchingContact = true;
            this.setState({ contactsData })
          }
        })
      })
    }
    this.keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", this.keyboardDidHide);
  }
  keyboardDidShow = e => {
    this.setState({ statusKeyboard: true });
  };

  keyboardDidHide = e => {
    this.setState({ statusKeyboard: false });
  };
  handleSearch = (text) => {
    let { contactsData } = this.state
    let contactDataFilter = contactsData.filter(function (data) {
      textLow = text.toLowerCase();
      if (data.displayName) {
        dataLow = data.displayName.toLowerCase();
        if (dataLow.indexOf(textLow) > -1) {
          return data.displayName;
        }
        else {
          return "";
        }
      }

    });
    this.isFiltered = true;
    this.setState({ contactDataFilter: [...contactDataFilter] });
  }
  clearSearch = () => {
    this.textInput.clear()
    let { contactsData } = this.state
    this.isFiltered = true;
    this.setState({ contactDataFilter: [...contactsData] });

  }
  handleOnShareOnSocailMedia = () => {
    const shareOptions = {
      title: 'BeBeep Share',
      message: "Utilise BeBeep ! Pour communiquer en voiture avec les gens autour de toi !",
      url: 'https://radio-screen.com/?lang=en',
      social: Share.Social.WHATSAPP,
      whatsAppNumber: "+85581363135"  // country code + phone number(currently only works on Android)
    };
    Share.open(shareOptions);
  }
  renderContacts = ({ item, index }) => {
    return (
      <View style={styles.inviteContainer}>
        <View>
          <Text style={styles.inviteTextContainer}>{item.displayName.length<20?item.displayName:item.displayName.substring(0,22)}</Text>
        </View>
        <View style={styles.inviteBottonContainer}>
          <TouchableOpacity style={styles.inviteBottonText}>
            <View style={{ marginTop: 1 }}>
              <Icon name='ios-add' type='Ionicons' style={{ color: 'white', fontSize: 18 }} />
            </View>
            <TouchableOpacity onPress={this.handleOnShareOnSocailMedia}>
              <View style={{ marginTop: 1 }}>
                <Text style={styles.inviteText}>Inviter</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    const { height } = Dimensions.get('window');
    // const divideHeight = (height / 2) - 20
    const { contactsData, contactDataFilter } = this.state
    var statusFilter = this.isFiltered || contactDataFilter && _.isEmpty(contactDataFilter) == false ? true : false;
    const allContactInfo = statusFilter ? contactDataFilter : contactsData
    return (
      <View style={stylesContainer.container}>
        <ScrollView style={[stylesContainer.listContainer, { height: '100%' }]}>
          <View style={stylesContainer.pageContainer}>
            <View style={stylesContainer.innerContainer}>
              <Text style={styles.textStyle}>Invitez vos contacts</Text>
              <Text style={{ fontSize: 16, paddingTop: 6 }}>Partagez BeBeep avec votre répertoire téléphonique</Text>
            </View>
            {/* start block search  */}
            <View style={{ height: height - 265 }}>
              <View style={{ alignItems: 'center', height: 45, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginLeft: 10, marginTop: 5 }}>
                <View style={{ flex: 3, marginRight: '2%', flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#edf0f5', borderRadius: 20 }}>
                  <View style={{ marginRight: 25, backgroundColor: 'red' }}>
                    <TouchableOpacity style={{ position: 'absolute', marginTop: 12, height: 48 }}>
                      <Icon name='search' type='EvilIcons' style={{ fontSize: 28 }} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: '60%' }}>
                    <TextInput
                      style={{ width: '100%', color: 'black', fontSize: 18, paddingLeft: 10 }}
                      placeholder='Rechercher...'
                      underlineColorAndroid="transparent"
                      ref={ref => { this.textInput = ref }}
                      maxLength={20}
                      onChangeText={(text) => this.handleSearch(text)}
                    />
                  </View>
                  <View style={{ width: 30 }}>
                    <TouchableOpacity style={{ position: 'absolute', marginTop: 10 }} onPress={this.clearSearch}>
                      <Icon name='closecircle' type='AntDesign' style={{ fontSize: 25, color: 'grey' }} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* start remove follow the feedback */}
                {/* <View style={{ paddingRight: 5 }}>
                              <TouchableOpacity>
                                  <Text style={{ fontSize: 18, color: '#b61fd1' }}>Annuler</Text>
                              </TouchableOpacity>
                          </View> */}
                {/* end remove follow the feedback */}

              </View>
              {/* 150 Contacts */}
              <View style={styles.contactContainer}>
                <View>
                  <Text style={styles.contactText}>{allContactInfo ? allContactInfo.length : 0} Contacts</Text>
                </View>

                {/* start remove follow the feedback */}
                {/* <View style={styles.contactBottonContainer}>
                              <TouchableOpacity>
                                  <View style={styles.contactBottonTextContainer}>
                                      <Text style={styles.contactBottonText}>Inviter tous</Text>
                                  </View>
                              </TouchableOpacity>
                          </View> */}
                {/*  end remove follow the feedback */}

              </View>
              <FlatList
                data={allContactInfo}
                renderItem={this.renderContacts}
                keyExtractor={(item, index) => index.toString()}
              />
              {
                !this.fetchingContact || allContactInfo && _.isEmpty(allContactInfo) == false ?
                  null
                  :
                  <View style={{
                    position: 'absolute', bottom: '45%', alignSelf: 'center'
                  }}>
                    <Text style={{ fontSize: 20, color: 'black' }}>No Result!</Text>
                  </View>
              }

            </View>
            {/* end block search */}

          </View>
        </ScrollView>
        <View style={stylesContainer.doneButtonContainer}>
          <DoneButton onPress={this.handleOnBottonCestFail} />
        </View>
      </View>

    )
  }
}













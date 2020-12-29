import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Icon, Label, Input, Item } from 'native-base';
import { NavigationActions, StackActions } from 'react-navigation'
import Share from 'react-native-share';
import Images from '../Themes/Images'
import LinearGradient from 'react-native-linear-gradient';
import styles from '../Containers/Styles/ChatScreenStyle'


export class ShareOption extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      headerStyle: {
        elevation: 0,
      },
      // title: 'Modifier groupe',
      headerTitleStyle: {
        textAlign: 'center',
        flexGrow: 1,
        alignSelf: 'center',
      },
      headerLeft: (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 12 }}>
          <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#B360D2' }} />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity onPress={() => params.goToMapScreen()} style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 18, color: '#8F8F94' }}>Passer</Text>
        </TouchableOpacity>
      ),
    };
  };
  componentWillMount = () => {
    this.props.navigation.setParams({
      goToMapScreen: this.goToMapScreen,
    });
  }
  goToMapScreen = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
    });
    this.props.navigation.dispatch(resetAction);
  }
  openShareOption = () => {
    const shareOptions = {
      title: 'BeBeep Share',
      message: "Utilise BeBeep ! Pour communiquer en voiture avec les gens autour de toi !",
      url: 'https://radio-screen.com/?lang=en',
      social: Share.Social.WHATSAPP,
      whatsAppNumber: "+85581363135"  // country code + phone number(currently only works on Android)
    };
    Share.open(shareOptions);
  }
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ paddingLeft: 13, paddingRight: 12, paddingBottom: 19 }}><Text style={{ fontSize: 22, fontWeight: 'bold', color: 'black' }}>Invitez vos contacts </Text></View>
        <View style={{ paddingLeft: 13, paddingRight: 12 }}>
          <Text style={{ fontSize: 16, color: 'black' }}>
            Invitez vos contacts à télécharger BeBeep. Pour cela, il vous suffit de cliquer sur le bouton ci-dessous.
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', position: 'absolute', bottom: 0, right: 0, left: 0 }}>
              <LinearGradient
                start={{ x: 0.0, y: 0.2 }} end={{ x: 0.5, y: 3.9 }}
                locations={[0, 0.5, 0.9]}
                colors={['#AE59C5', '#B23393', '#BA0F60']}
                style={styles.linearGradient}>
                <TouchableOpacity onPress={this.openShareOption}>
                  <View style={{ height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                    <TouchableOpacity onPress={this.openShareOption}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>Inviter des amis à utiliser</Text>
                      </View>
                    </TouchableOpacity>

                    <View>
                      <Image style={{ width: 90, height: 40, borderColor: 'white', marginTop: 10 }}
                        source={require('../Images/bebeeplogo.png')}
                      />
                    </View>
                    <TouchableOpacity onPress={this.openShareOption}>
                      <View>
                        <Icon style={{ fontSize: 26, color: 'grey', fontWeight: 'bold' }} name='right' type='AntDesign' />
                      </View>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </View>
      </View >
    )
  }
}


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
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: '#707070',
    height: 45,
    width: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
});


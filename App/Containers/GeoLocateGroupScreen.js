import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity,
  TextInput, Image
} from 'react-native';
import styles from './Styles/CreateGroupScreenStyle'
import { ApplicationStyles, Variables } from '../Themes';
import LinearGradient from 'react-native-linear-gradient';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { connect } from 'react-redux'
import { Icon, Label, Input, Item } from 'native-base';

class GeoLocateGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentAddress: ''
    }
    this.createGroupData = this.props.navigation.state.params.createGroupData
    global.fromSceneName=''
  }
  // static navigationOptions = ({ navigation }) => {
  //     return {
  //       headerStyle: {
  //         elevation: 0,
  //       },
  //       headerLeft: (
  //         <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 12 }}>
  //           <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#B360D2' }} />
  //         </TouchableOpacity>
  //       ),

  //   }

  // };
  handleGetAddressFromLatlon = (lat, lon) => {
    return fetch('https://api.mapbox.com/v4/geocode/mapbox.places/' + lon + ',' + lat + '.json?access_token=' + Variables.apiMapBoxKey)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson) {
          this.setState({ currentAddress: responseJson.features[0].place_name });
        }
      })
  }
  componentWillMount = () => {

    let { coordinateCurrentUser } = this.state
    navigator.geolocation.getCurrentPosition(
      (position) => {
        coordinateCurrentUser = [position.coords.longitude, position.coords.latitude];
        this.handleGetAddressFromLatlon(position.coords.latitude, position.coords.longitude);
        this.setState({ coordinateCurrentUser });
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }
  handleOnContinuer = () => {
    global.fromSceneName='GeoLocateGroupScreen'
    this.props.navigation.navigate('InviteFriendsIntoGroupScreen', { createGroupData: this.createGroupData })
  }
  render() {
    const currentAddress = this.props.navigation.getParam('currentAddress')
    return (
      <View style={styles.container}>
        <Text style={styles.bigTitle}>Géolocalisez votre groupe</Text>
        <Text style={styles.description}>Communiquez avec votre communauté{'\n'}locale</Text>
        <View style={{ flex: 1, marginTop:'30%', bottom: 60 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.subTitle}>Position</Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('GeoLocalizeScreen')}>
              <Text style={[styles.description, { color: '#B360D2' }]}>Modifier</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 30 }} />
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            onPress={() => this.props.navigation.navigate('GeoLocalizeScreen')}
          >
            <Text style={{ fontSize: 16, color: '#B360D2', flex: 1.5 }}>
              {currentAddress == null ?
                this.state.currentAddress :
                currentAddress
              }</Text>
            {/* <Image source={Images.smallMap} style={{ height: 50, width: 65 }} /> */}
            <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => this.props.navigation.navigate('GeoLocalizeScreen')}>
              <MapboxGL.MapView
                ref={(c) => this._map = c}
                style={{ width: 50, height: 50 }}
                zoomLevel={9}
                showUserLocation={true}
                userTrackingMode={3}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
        <LinearGradient
          start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
          locations={[0, 0.6]}
          colors={['#C20657', '#B360D2']}
          style={ApplicationStyles.button}>
          <TouchableOpacity
            style={ApplicationStyles.linearGradiantButton}
            onPress={this.handleOnContinuer}>
            <Text style={{ fontSize: 18, color: 'white' }}>Continuer</Text>
          </TouchableOpacity>

        </LinearGradient>
      </View>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    userSettings: state.settings.userData
  }
}
export default connect(mapStateToProps, null)(GeoLocateGroupScreen)

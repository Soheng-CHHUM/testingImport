import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import LinearGradient from 'react-native-linear-gradient';
import { ApplicationStyles, Images, Variables } from '../Themes'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default class GeoLocalizeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentAddress: '',
            coordinateCurrentUser: [0, 0]


        }
        this.isDisplayUserLocationPoint = true;
    }

    componentWillMount = () => {

        let {coordinateCurrentUser} = this.state
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

    handleGetAddressFromLatlon = (lat, lon) => {
        return fetch('https://api.mapbox.com/v4/geocode/mapbox.places/' + lon + ',' + lat + '.json?access_token=' + Variables.apiMapBoxKey)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson) {
                    this.setState({ currentAddress: responseJson.features[0].place_name });
                }
            })
    }

    onMapPress = (event) => {
        if (event) {
            this.isDisplayUserLocationPoint = false;
            const { geometry } = event
            this.handleGetAddressFromLatlon(geometry.coordinates[1], geometry.coordinates[0]);
            this.setState({ coordinateCurrentUser: geometry.coordinates });
        }
    }
    dialogSelectMarker = () => {
        return (
            <View style={[internalStyles.headerOfDialog, { height: this.heightDialogScreen }]}>
                <View style={ApplicationStyles.topLine} />

                <View style={{ justifyContent: 'space-around', height: "100%", flexDirection: 'column', paddingBottom: 20 }}>
                    <Text style={[ApplicationStyles.txtDescription, { color: '#B360D2', alignSelf: 'center',padding: 16 }]}>
                        {
                            this.state.currentAddress
                        }
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <LinearGradient
                            start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
                            locations={[0, 0.6]}
                            colors={['#C20657', '#B360D2']}
                            style={internalStyles.gradientBtn}>
                            <TouchableOpacity
                            style={ApplicationStyles.linearGradiantButton}
                            onPress={()=>this.props.navigation.navigate('GeoLocateGroupScreen',{currentAddress: this.state.currentAddress})}
                            >
                                <Text style={{ fontSize: 18, color: 'white' }}>
                                    OK
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                        <TouchableOpacity style={internalStyles.btnCancel} onPress={()=>this.props.navigation.goBack()}>
                            <Text style={ApplicationStyles.txtDescription}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
    render() {
        let { coordinateCurrentUser } = this.state
        return (
            <View style={{ flex: 1 }}>
                <MapboxGL.MapView
                    ref={(c) => this._map = c}
                    style={{ flex: 1 }}
                    zoomLevel={9}
                    showUserLocation={
                        this.isDisplayUserLocationPoint
                    }
                    userTrackingMode={MapboxGL.UserTrackingModes.FollowWithHeading}
                    onPress={this.onMapPress}
                // centerCoordinate={this.state.usersData}

                >

                    {
                        !this.isDisplayUserLocationPoint ?
                            <MapboxGL.PointAnnotation
                                key="pointAnnotation"
                                id="pointAnnotation"
                                coordinate={coordinateCurrentUser}>
                                <Image
                                    source={Images.marker}
                                    style={{
                                        flex: 1,
                                        // resizeMode: 'contain',
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25
                                    }} />
                            </MapboxGL.PointAnnotation>
                            :
                            null
                    }

                </MapboxGL.MapView>

                {
                    this.dialogSelectMarker()
                }

            </View>
        );
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

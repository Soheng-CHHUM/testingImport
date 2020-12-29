import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView,StyleSheet } from 'react-native';
import { Icon, Label, Input, Item } from 'native-base';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import styles from './Styles/CreateGroupScreenStyle'
import ImagePicker from 'react-native-image-crop-picker';
import GroupService from '../Services/GroupService'

import LinearGradient from 'react-native-linear-gradient';
import { ApplicationStyles, Images, Variables } from '../Themes'
import { NavigationActions, StackActions } from 'react-navigation'


export class GroupAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: '',
      groupIsPrivate: false,
      groupInfo: this.props.navigation.state.params.groupInfo,
      chatroom: this.props.navigation.state.params.chatroom,
      currentAddress: '',
      visibility: [{ key: 'Privé', value: false },{ key: 'Public', value: true }],
      modifyPosition: false,
      coordinatePosition: [0, 0]
    }
    this.isDisplayUserLocationPoint = true;
  }
  static navigationOptions = ({ navigation }) => {
    const {params = {}} = navigation.state;
    if (params && !params.header) {
      return {header: null};
    }else{
    return {
      headerStyle: {
        elevation: 0,
      },
      title: 'Modifier groupe',
      headerTitleStyle: {
        textAlign: 'center',
        flexGrow: 1,
        alignSelf: 'center',
      },
      headerLeft: (
        <TouchableOpacity onPress={()=>navigation.goBack()} style={{ paddingLeft: 12 }}>
          <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#B360D2' }} />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity onPress={ () => params.handleValidateModifiedGroup() } style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 18, color: '#8F8F94' }}>Valider</Text>
        </TouchableOpacity>
      ),
    };
  }

  };

hideAndShowHeader = (status) => {
    // Set the params to pass in fullscreen isVisible to navigationOptions
    this.props.navigation.setParams({
      header: status,
    });
}

  handleValidateModifiedGroup = () =>{
    GroupService.updateGroup(this.state.chatroom.groupID, this.state.groupInfo)
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
    });
    this.props.navigation.dispatch(resetAction);
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

  handleTags = (index) =>{
      let tags = this.state.groupInfo.tags
      tags.splice(index, 1);
      this.handleUpdateGroupInfo(tags, 'tags')
  }

  handleUpdateGroupInfo = (value, field_name) =>{
    let groupInfo = this.state.groupInfo
    mergegroupInfo = {...groupInfo, ...{[field_name]: value}}
    this.setState({groupInfo:mergegroupInfo});
  }

  handleEditPhoto = () => {
    ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        includeBase64: true,
        includeExif: true,
    }).then(image => {
        let picture = `data:${image.mime};base64,` + image.data;
        this.handleUpdateGroupInfo(picture, 'picture')
    }).catch(e => console.log(e));
  }

  componentWillMount = () => {
    this.props.navigation.setParams({
      handleValidateModifiedGroup: this.handleValidateModifiedGroup,
      hideAndShowHeader: this.hideAndShowHeader(true)
    });

    let {groupInfo, coordinatePosition} = this.state
    if(groupInfo && groupInfo.geo){
      const {position, address} = groupInfo.geo
      let coordinatePosition = [position[1], position[0]];
      this.isDisplayUserLocationPoint = false;
      this.setState({coordinatePosition, currentAddress: address});
    }else{
        navigator.geolocation.getCurrentPosition(
          (position) => {
              coordinatePosition = [position.coords.longitude, position.coords.latitude];
              this.handleGetAddressFromLatlon(position.coords.latitude, position.coords.longitude);
              this.setState({ coordinatePosition });
          },
          (error) => console.log(error.message),
          { enableHighAccuracy: true}
        );
    }

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
        this.setState({ coordinatePosition: geometry.coordinates });
    }
}

savePosition = ()=>{
  let {currentAddress, coordinatePosition} = this.state
  let geo = {
    address: currentAddress,
    position: [coordinatePosition[1], coordinatePosition[0]]
  }
  this.setState({modifyPosition: false});
  this.handleUpdateGroupInfo(geo, 'geo')
  this.hideAndShowHeader(true)
}

handleCancelModifyPosition = ()=>{
  this.setState({modifyPosition: false});
  this.hideAndShowHeader(true)
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
                        onPress={this.savePosition}
                        >
                            <Text style={{ fontSize: 18, color: 'white' }}>
                                OK
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                    <TouchableOpacity style={internalStyles.btnCancel} onPress={this.handleCancelModifyPosition}>
                        <Text style={ApplicationStyles.txtDescription}>Annuler</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

handlePressModifyPosition = ()=>{
  this.hideAndShowHeader(null);
  this.setState({modifyPosition: true});
}
onPressFindFriendsScreen=()=>{
  global.fromSceneName = 'MapScreen'
  this.props.navigation.navigate('InviteFriendsIntoGroupScreen', { invite_method: 'update', chatroom: this.state.chatroom })

}

  render() {
    let {groupInfo, visibility, coordinatePosition, currentAddress} = this.state
    return (
      !this.state.modifyPosition?
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <ScrollView>
          {/* Image contaienr */}
          <View style={{ height: 190 }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: groupInfo.picture }} style={{ height: 180 }} />
            </View>
            <View style={{ position: 'absolute', bottom: 20, right: 25, backgroundColor: 'white', paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5, borderRadius: 8 }}>
              <TouchableOpacity onPress={this.handleEditPhoto}>
                <Text style={{ color: 'black', fontSize: 16 }}>Éditer photo</Text>
              </TouchableOpacity>
            </View>

          </View>
          {/* Text contaienr */}
          <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10, paddingTop: 10, position: 'relative' }}>
            {/* block name */}
            <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ flex: 2 }}>
                <Item floatingLabel>
                  <Label style={{ color: 'black', fontWeight: 'bold',fontSize:22,paddingLeft:5 }}>Nom</Label>
                  <Input
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={groupInfo.name}
                    // onEndEditing={(eachLabel) => this.handleEngChangeTextInput(eachLabel)}
                    onChangeText={(value) => this.handleUpdateGroupInfo(value, 'name')}
                  />
                </Item>
              </View>
            </View>
            {/* block Visibilite and private public */}



            <View style={{ flexDirection: 'column',paddingLeft:5 }}>
              <View>
                <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold', paddingBottom: 10, paddingTop: 20 }}>Visibilité</Text>
              </View>
              {
                visibility.map((eachVisibility)=>{
                  const { value, key } = eachVisibility
                  return(
                    <View style={{ justifyContent: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15 }}>
                      <Text style={{ fontSize: 18, color: 'black' }}>{key}</Text>
                      <TouchableOpacity onPress={()=>this.handleUpdateGroupInfo(value, 'isPublic')}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: 24, height: 24, borderColor: '#B360D2', borderWidth: 1, borderRadius: 50 }}>
                            <View style={{ width: 14, height: 14, borderRadius: 50, backgroundColor: value==groupInfo.isPublic?'#B360D2':'transparent'}}></View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )
                })
              }
            </View>
            {/* block Tags */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
              <View><Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold' }}>Tags</Text></View>
              <View><TouchableOpacity><Text style={{ fontSize: 20, color: '#B360D2' }}>Tout effacer</Text></TouchableOpacity></View>
            </View>
            {
              groupInfo.tags?groupInfo.tags.map((data, index) => {
                  return (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
                      <View><Text style={{ fontSize: 16 }}>{data}</Text></View>
                      <TouchableOpacity onPress={() => this.handleTags(index)} style={{width: 50}}>
                        <Icon name='close' type="AntDesign" style={{ fontSize: 20, color: 'grey', textAlign: 'right'}} />
                      </TouchableOpacity>
                    </View>
                  )
                })
              :null
            }
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, marginBottom: 10 }}>
              <View><Text style={{ fontSize: 20, color: 'black',fontWeight:'bold' }}>Position</Text></View>
              <View><TouchableOpacity onPress={this.handlePressModifyPosition}><Text style={{ fontSize: 20, color: '#B360D2' }}>Modifier</Text></TouchableOpacity></View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, marginBottom: 70 }}>
              <View style={{flexWrap:'wrap',width:'60%'}}><Text style={{ fontSize: 18, color: 'black',marginTop:10, }}>{currentAddress}</Text></View>
              <View style={{width:30}}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                >
                  {/* <Text style={{ fontSize: 16, color: '#B360D2', flex: 1.5 }}>
                    {currentAddress}</Text> */}
                  <TouchableOpacity style={{flex: 1, alignItems: 'flex-end' }}>
                    <MapboxGL.MapView
                      ref={(c) => this._map = c}
                      style={{ width: 55, height: 55 }}
                      zoomLevel={9}
                      showUserLocation={true}
                      userTrackingMode={3}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

              </View>
            </View>
            {/* map block */}
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#B360D2' }}>
          <TouchableOpacity onPress={this.onPressFindFriendsScreen} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, paddingLeft: 10, paddingRight: 10 }}>
            <View><Text style={{ fontSize: 17, fontWeight: 'bold', color: 'white' }}>Inviter des amis</Text></View>
            <View><Icon name='right' type="AntDesign" style={{ fontSize: 20, color: 'white' }} /></View>
          </TouchableOpacity>
        </View>
      </View >
      :

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
                coordinate={coordinatePosition}>
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


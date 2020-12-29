import React, { Component } from 'react';
import {
  View, Text, ScrollView, Dimensions,
  TextInput, StyleSheet, TouchableOpacity, ImageBackground
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Images, ApplicationStyles } from '../Themes'
import FirebaseService from '../Services/Firebase'
import styles from './Styles/PrivateGroupScreenStyle'
import firebaseBase from 'react-native-firebase';
import { connect } from 'react-redux'
import _ from 'lodash'
import GroupService from '../Services/GroupService'
class PrivateGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenOne: true,
      screenTwo: false,
      item: this.props.navigation.state.params.item,
      statusJoinGroup: "",
      groupDetail:''

    }
  }

  handleOnButton = () => {
    const { screenOne, item } = this.state;
    userKey = []
    userKey.push(this.props.user.Key)
    const groupKey = item.key
    const statusGroup = item.isPublic

    if (this.props.callback) this.props.callback(true)

    if (statusGroup) {
      uniqueKeyUsers = _.uniq([...item.users, ...userKey])
      let groupData = {
        users: uniqueKeyUsers
      }
      GroupService.filterGroupInChatroom(groupKey);
      GroupService.updateGroup(groupKey, groupData);
      this.props.navigation.navigate('MapScreen')
    }
    else {
      // GroupService.updateGroupStatus(groupKey,statusJoinGroup);
      GroupService.subscribe(userKey, groupKey);


      if (screenOne) {
        this.setState({
          screenOne: false,
          screenTwo: true
        });
      } else {
        this.setState({
          screenOne: true,
          screenTwo: false
        });
      }

      // if (this.state.item && this.state.item.isPublic) {
      //   GroupService.subscribe(userKey, groupKey);
      //   this.props.navigation.navigate('MapScreen')
      // }
    }
  }
  goBack() {
    if (this.props.callback) this.props.callback(false)
    this.props.navigation.goBack()
  }
  componentWillMount = () => {
    const item = this.props.navigation.state.params.item;
    const currentUserKey = this.props.user.key
    const groupKey = item.key
    GroupService.getGroupDetail(currentUserKey, groupKey, (groupDetail) => {
        this.setState({ statusJoinGroup: groupDetail.status,groupDetail });
    });
  }

  render() {
    const { screenOne, screenTwo, item } = this.state;
    const currentUserKey = this.props.user.key
    const groupOwnerKey = this.state.item.createdBy
    const groupMember = this.state.item.users

    return (
      <ImageBackground source={{ uri: this.state.item.picture }} style={styles.container} >
        <TouchableOpacity
          onPress={() => this.goBack()}
          style={styles.crossButton}>
          <Ionicons name='md-close-circle' size={32} style={{ color: 'white' }} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <View style={styles.txtPopUptitleContainer}>
            <Text style={styles.txtPopUpTitle}>{item.name}</Text>
            {!item.isPublic ? <FontAwesomeIcon name='lock' size={20} color={'white'} style={{ marginLeft: 16 }} /> : null}
          </View>
          <Text style={{ fontSize: 15, color: 'white' }}>{item.isPublic ? 'Groupe public' : 'Groupe privé'}</Text>
        </View>
        <View style={styles.popUpContainer}>
          <View style={ApplicationStyles.topLine} />
          {
            screenOne ?
              item.isPublic ?
                //check for public group owner or not.
                currentUserKey == groupOwnerKey ?
                  <Text style={styles.txtPopUpDesc}>
                    Vous êtes l'administrateur de ce groupe.
                </Text>
                  :
                  //check public group member or not.
                  groupMember.includes(currentUserKey) ?
                    <Text style={styles.txtPopUpDesc}>
                      Vous êtes membre de ce groupe.
                  </Text>
                    :
                    <Text style={styles.txtPopUpDesc}>
                      Pour pouvoir participer dans un groupe public, il vous suffit de cliquer sur le bouton ci-dessous.
                  </Text>
                :
                //end check public group member or not.

                //check for private group
                currentUserKey == groupOwnerKey ?
                  <Text style={styles.txtPopUpDesc}>
                    Vous êtes l'administrateur de ce groupe.
                  </Text>
                  :
                  //check public group member or not.
                  groupMember.includes(currentUserKey) ?
                    <Text style={styles.txtPopUpDesc}>
                      Vous êtes membre de ce groupe.
                    </Text>
                    :
                    <Text style={styles.txtPopUpDesc}>
                      Pour pouvoir participer dans un groupe privé votre demande doit être acceptée.
                    </Text>
              //end check for private group
              :
              this.state.statusJoinGroup == "pedding" ?
                <Text style={styles.txtPopUpDesc}>
                  Si votre demande est acceptée, trouvez la conversation de se groupe dans la fenêtre du Chat Privé.
                </Text>
                :
                this.state.statusJoinGroup == "approved" ?
                  <Text style={styles.txtPopUpDesc}>
                    Vous êtes membre de ce groupe.
                  </Text>
                  :
                  screenTwo ?
                    <Text style={styles.txtPopUpDesc}>
                      Si votre demande est acceptée, trouvez la conversation de se groupe dans la fenêtre du Chat Privé.
                </Text>
                    :
                    null
          }
          {/* check button to show */}
          {currentUserKey == groupOwnerKey || groupMember.includes(currentUserKey) ? null
            :
            <TouchableOpacity
              style={
                this.state.statusJoinGroup == "pedding" && this.state.groupDetail.userKey.includes(currentUserKey)?
                  [styles.popUpButton, { backgroundColor: '#CCCCCC' }]
                  : this.state.statusJoinGroup == "approved" && this.state.groupDetail.userKey.includes(currentUserKey) ?null:
                    screenOne ? [styles.popUpButton, { backgroundColor: '#B360D2' }]
                      :
                      screenTwo ? [styles.popUpButton, { backgroundColor: '#CCCCCC' }]
                        : null
              }
              onPress={
                item.isPublic ?
                  this.handleOnButton
                  :
                  screenOne ? this.handleOnButton : null
              }
            >

              {
                this.state.statusJoinGroup == "pedding"?
                  <Text style={styles.textButton}>
                    Votre demande est en attente ⏱
                  </Text>
                  : this.state.statusJoinGroup == "approved"? null :
                    <Text style={styles.textButton}>
                      {
                        screenOne ? 'Participer' : screenTwo ? 'Votre demande est en attente ⏱' : null
                      }
                    </Text>
              }

            </TouchableOpacity>
          }


          {/* end check button to show */}

        </View>
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
}

export default connect(mapStateToProps, null)(PrivateGroupScreen)


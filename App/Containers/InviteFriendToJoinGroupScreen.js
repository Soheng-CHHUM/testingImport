import React, { Component } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { connect } from 'react-redux'
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
import Translator from '../Translations/Translator'
import SearchListForInviteToJoinGroup from '../Components/Search/SearchListForInviteToJoinGroup'
import ContactRow, { refreshFriendsList, refreshContactsList } from '../Components/Search/ContactRow'
import PassHeader from '../Components/Headers/PassHeader'
import DoneButton from '../Components/DoneButton'
import GroupService from '../Services/GroupService'
import Group from '../Models/Group';
import ThreadActions from '../Redux/ThreadRedux'

// Styles
import styles from './Styles/FindFriendsScreenStyle'
import AppConfig from '../Config/AppConfig';
import UserService from '../Services/User'
import Chatroom from '../Models/Chatroom'
import { Functions } from '../Themes'
import { NavigationActions, StackActions } from 'react-navigation'


// const NEXT_SCREEN_NAME = 'FindContactsScreen'
// const NEXT_SCREEN_NAME = global.fromSceneName=="MapScreen"?"MapScreen":"GeoLocateGroupScreen"


class InviteFriendToJoinGroupScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.user,
      contacts: [],
      statusLoading: false,
    }
    global.currentScene = "InviteFriendToJoinGroupScreen";
    this.usersKey = []
    this.selectedUsers = [];
    this.createGroupData = this.props.navigation.state.params.createGroupData
    this.invite_method = this.props.navigation.state.params.invite_method
    this.chatroom = this.props.navigation.state.params.chatroom
  }

  // static navigationOptions = ({ navigation }) =>
  // PassHeader.getNoBack(navigation, global.fromSceneName=="MapScreen"?"MapScreen":"GeoLocateGroupScreen")

  componentDidMount() {
    refreshFriendsList().then(contacts => this.setState({ contacts }))
  }

  componentWillReceiveProps(props) {
    if (global.currentScene == "InviteFriendToJoinGroupScreen") {
      if (props.user && props.user != this.state.user) this.setState({ user: props.user })
    }
  }
  goNext() {
    return refreshContactsList().then(() => {
      return this.props.navigation.navigate(global.fromSceneName == "MapScreen" ? "MapScreen" : "GeoLocateGroupScreen")
    })
  }

  uniqueValue = (data)=>{
    return data.filter((v, i, a) => a.indexOf(v) === i);
  }

  onPressDone = () => {
    const { Key } = this.props.user
    this.usersKey = [];
    this.setState({ statusLoading: true });
    if (this.selectedUsers) {
      this.selectedUsers.map((eachUsers) => {
        this.usersKey.push(eachUsers.key)
      })
    }

    if (this.invite_method == "update" && this.chatroom) {
      mergeUsersKey = [...this.chatroom.users, ...this.usersKey];
      GroupService.updateGroupAndChatroom(this.chatroom.groupID, this.chatroom.key, this.uniqueValue(mergeUsersKey), (status) => {
        if (status) {
          global.chatroom = null;
          this.setState({ statusLoading: false });

          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
          });
          this.props.navigation.dispatch(resetAction);
        }
      })
    }
    else {
      if (this.usersKey.length > 0) {
        let mergeCreateGroupData = { ...this.createGroupData, ...{ users: this.uniqueValue(this.usersKey)} };
        GroupService.create(Key, new Group(mergeCreateGroupData), (grp, err) => {
          GroupService.inviteUsers(this.props.user.key, this.usersKey, grp.key)
          UserService.createChatRoom(new Chatroom({
            name: grp.name,
            users: this.uniqueValue(this.usersKey),
            groupID: grp.key,
            createdBy: Key,
            image: mergeCreateGroupData.picture ? mergeCreateGroupData.picture : mergeCreateGroupData.image
          }), (chatroom) => {
            global.chatroom = null;
            this.props.setCurrentThread(chatroom.key)
            this.setState({ statusLoading: false });
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
            });
            this.props.navigation.dispatch(resetAction);
          })
        })
      } else {
        let mergeCreateGroupData = { ...this.createGroupData, ...{ users: this.uniqueValue([this.props.user.key]) } };
        GroupService.create(Key, new Group(mergeCreateGroupData), (grp, err) => {
          UserService.createChatRoom(new Chatroom({
            name: grp.name,
            users: this.uniqueValue([this.props.user.key]),
            groupID: grp.key,
            createdBy: Key,
            image: mergeCreateGroupData.picture ? mergeCreateGroupData.picture : mergeCreateGroupData.image
          }), (chatroom) => {
            global.chatroom = null;
            this.setState({ statusLoading: false });
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'MapScreen' })],
            });
            this.props.navigation.dispatch(resetAction);
          })
        })
      }
    }
  }

  handleSelectedUsers = (items) => {
    this.selectedUsers = items;
  }
  render() {
    return (
      <View style={styles.container}>
        {
          Functions.loading(this.state.statusLoading)
        }
        <ScrollView style={[styles.listContainer, { height: '100%' }]}>
          <View style={styles.pageContainer}>
            <View style={styles.innerContainer}>
              <Text style={styles.titleText}>Invitez des amis</Text>
              <Text style={styles.paragraph}>Invitez des membres pour votre groupe</Text>
            </View>
            <SearchListForInviteToJoinGroup
              chatroom={this.chatroom}
              onPressCancel={() => this.goNext()}
              ref={component => this._searchComponent = component}
              user={this.state.user}
              onPressSelectedUsers={(items) => this.handleSelectedUsers(items)}
              searchables={[ContactRow]} />

          </View>
        </ScrollView>
        <View style={styles.doneButtonContainer}>
          <DoneButton onPress={this.onPressDone} />
        </View>
      </View>

    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentThread: (data) => dispatch(ThreadActions.setThread(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteFriendToJoinGroupScreen)

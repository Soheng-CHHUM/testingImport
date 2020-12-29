import React,{Component} from 'react';
import {View,Text,Image,TouchableOpacity,
  ScrollView,StyleSheet, TextInput, Keyboard} from 'react-native';
import SearchListStyle from '../Components/Styles/SearchListStyle'
import Translator from '../Translations/Translator'
import UserService from '../Services/User'
import {ApplicationStyles, Colors} from '../Themes'
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons'
import DoneButton from '../Components/DoneButton'
import { Functions } from '../Themes'
import styles from './Styles/FindFriendsScreenStyle'
import Icon from 'react-native-vector-icons/MaterialIcons'
import GroupService from '../Services/GroupService'
import Chatroom from '../Models/Chatroom'
import { connect } from 'react-redux'
import { NavigationActions, StackActions } from 'react-navigation'
import Group from '../Models/Group';
import ThreadActions from '../Redux/ThreadRedux'

class InviteFriendsIntoGroupScreen extends Component{

  static propTypes = {
    chatroom: PropTypes.object,
  }

  constructor(props){
    super(props);
    this.state={
      friendsData: [],
      searchText: '',
      statusKeyboard: false
    }
    this.friendsData = [];
    this.chatroom_users_key = [];

    global.currentScene = "InviteFriendsIntoGroupScreen";
    this.createGroupData = this.props.navigation.state.params.createGroupData
    this.invite_method = this.props.navigation.state.params.invite_method
    this.chatroom = this.props.navigation.state.params.chatroom


  }

  componentWillMount(){
    if(this.props.navigation.state.params.chatroom && this.props.navigation.state.params.chatroom.users){
      this.chatroom_users_key = this.props.navigation.state.params.chatroom.users;
    }
    if(this.props.user && this.props.user.key){
      UserService.getFriends(this.props.user.key, (friendsData) => {
        if(friendsData){
          this.friendsData = friendsData;
          this.setState({friendsData});
        }
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



  handleListFriends = (eachFriend, index)=>{
   
    const {chatroom} = this.state
    var isMember = false;
    this.chatroom_users_key.map((eachUserKey)=>{
      if(eachUserKey==eachFriend.friendKey){
        isMember = true;
      }
    })

    return(
        <View key={`View_Top_${index}`} style={SearchListStyle.listItem}>
            <TouchableOpacity style={{width: '15%'}}>
                <Image placeholderColor={'#afafaf'}
                    style={[ApplicationStyles.radioAvatar, {
                        borderRadius: 25,
                        borderWidth: 1,
                        width: 50,
                        height: 50}]}
                    resizeMode="contain"
                    source={{ uri: eachFriend.Avatar }}/>
              </TouchableOpacity>

            <View style={[SearchListStyle.secondColumn, {width: '50%'}]}>
                <Text key={`Text${index}_${eachFriend.Name}`} style={SearchListStyle.listItemText}>{eachFriend.Name}</Text>
            </View>
            {
              isMember?
                <View style={[SearchListStyle.thirdColumn, {flexDirection: 'row', width: '35%', backgroundColor: '#EBEBF2'}]}>
                    <Ionicons name="ios-send" size={20} />
                    <Text style={{ color: 'black' }}>  {Translator.t('common.invited')}</Text>
                </View>
              :
                <TouchableOpacity onPress={()=>this.inviteFriend(eachFriend.friendKey)} style={[SearchListStyle.thirdColumn,{width: '35%'}]}>
                  <Text style={{ color: 'white' }}> + {Translator.t('common.invite')}</Text>
                </TouchableOpacity>
            }
        </View>
    )
  }

  inviteAllFriends = ()=>{
    const { friendsData } = this.state
    friendsData.map((eachFriend, index)=>{
      this.chatroom_users_key.push(eachFriend.friendKey);
    })
    this.chatroom_users_key = this.uniqueValue(this.chatroom_users_key)
    this.setState({searchText: this.state.searchText});
  }

  uniqueValue = (data)=>{
    return data.filter((v, i, a) => a.indexOf(v) === i);
  }

  inviteFriend = (friendKey)=>{
    this.chatroom_users_key.push(friendKey);
    this.setState({searchText: this.state.searchText});
  }

  handleClearSearch = ()=>{
    this.setState({searchText: ''});
  }

  handleSearchFriends = (searchText) => {
    if(searchText){
      let friendsDataFilter = this.friendsData.filter(function (data) {
        searchTextLow = searchText.toLowerCase();
        if (data.Name) {
          NameLow = data.Name.toLowerCase();
          if (NameLow.indexOf(searchTextLow) > -1) {
            return data.Name;
          }
          else {
            return "";
          }
        }
      });
      this.setState({ friendsData: [...friendsDataFilter], searchText });
    }else{
      this.setState({ friendsData: [...this.friendsData], searchText });
    }
  }





  onPressDone = () => {
    const { Key } = this.props.user
    this.setState({ statusLoading: true });
    if (this.invite_method == "update" && this.chatroom) {
      GroupService.updateGroupAndChatroom(this.chatroom.groupID, this.chatroom.key, this.uniqueValue(this.chatroom_users_key), (status) => {
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
          if (this.chatroom_users_key.length > 0) {
            let mergeCreateGroupData = { ...this.createGroupData, ...{ users: this.chatroom_users_key} };
            GroupService.create(Key, new Group(mergeCreateGroupData), (grp, err) => {
              GroupService.inviteUsers(this.props.user.key, this.chatroom_users_key, grp.key)
              UserService.createChatRoom(new Chatroom({
                name: grp.name,
                users: this.chatroom_users_key,
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
            let mergeCreateGroupData = { ...this.createGroupData, ...{ users: this.chatroom_users_key } };
            GroupService.create(Key, new Group(mergeCreateGroupData), (grp, err) => {
              UserService.createChatRoom(new Chatroom({
                name: grp.name,
                users: this.chatroom_users_key,
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

  render(){
    const { friendsData, statusKeyboard, searchText } = this.state
    return(
      <View style={styles.container}>
      {
        Functions.loading(this.state.statusLoading)
      }
      <ScrollView style={[styles.listContainer, { height: '100%', padding: 20 }]}>
          <View style={[styles.innerContainer, {padding: 0}]}>
            <Text style={styles.titleText}>Invitez des amis</Text>
            <Text style={styles.paragraph}>Invitez des membres pour votre groupe</Text>
          </View>

          <View style={SearchListStyle.newsearchBar}>
            <Icon
              name="search"
              size={26}
              color="#C8C7CD"
            />
            <View style={SearchListStyle.searchInputContainer}>
              <TextInput style={SearchListStyle.searchInput}
                placeholder=""
                autoCapitalize='none'
                selectionColor={Colors.mainColor}
                value={searchText}
                onChangeText={(searchText) => this.handleSearchFriends(searchText)} 
                />
            </View>
            <TouchableOpacity onPress={this.handleClearSearch}>
              <Icon
                name="cancel"
                size={26}
                color="#C8C7CD"
              />
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', marginTop: 20, marginBottom: 20}}>
              <View style={{}}>
    <Text style={{fontSize:15,color:Colors.mainColor}}>{friendsData.length} {friendsData.length>1?'Amis':'Ami'}</Text>
              </View>
              <TouchableOpacity onPress={this.inviteAllFriends}>
                <View style={SearchListStyle.button}>
                    <Text style={{color: Colors.mainColor}}>Inviter Tous</Text>
                </View>
              </TouchableOpacity>
          </View>
          
            {
              friendsData.map((eachFriend, index)=>{
                return(
                  this.handleListFriends(eachFriend, index)
                )
              })
            }

        <View style={{paddingTop: 120}}>
        </View>

      </ScrollView>
      {
        !statusKeyboard?
          <View style={styles.doneButtonContainer}>
            <DoneButton onPress={this.onPressDone} />
          </View>
        :
          null
      }
      
      </View>



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
    setCurrentThread: (data) => dispatch(ThreadActions.setThread(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteFriendsIntoGroupScreen)
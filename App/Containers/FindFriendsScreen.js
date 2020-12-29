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
import PassHeader from '../Components/Headers/PassHeader'
const NEXT_SCREEN_NAME = 'FindGroupScreen'
import ContactService from '../Services/ContactService'
import AppConfig from '../Config/AppConfig';
import Searcher from '../Services/Searcher'
import _ from 'lodash'
import UserPopUp from '../Components/UserPopUp'

class FindFriendsScreen extends Component{

  static propTypes = {
    chatroom: PropTypes.object,
  }

  constructor(props){
    super(props);
    this.state={
      userLists: [],
      searchText: '',
      statusKeyboard: false,
      friendsAndFriendsRequestData: null,
      isPopUpVisible: false,
      selectedUser: null

    }
    this.friendsAndFriendsRequestData = [];
    this.invited_users_as_friend = [];

    this.tempUserLists = [];

    global.currentScene = "FindFriendsScreen";
    this.chatroom = null;

  }
  static navigationOptions = ({ navigation }) => PassHeader.getNoBack(navigation, NEXT_SCREEN_NAME)

  async componentWillMount(){
    Searcher.filterFriendsAndFriendsRequest(this.props.user.Key, (snapshot) => {
      this.friendsAndFriendsRequestData = snapshot;
    });

    const contactsList = await ContactService.getAll();
    let phoneContacts = [];
    if(contactsList){
      contactsList.map((eachContact)=>{
        if(eachContact.phoneNumbers && eachContact.phoneNumbers.length> 0){
          var result = eachContact.phoneNumbers[0].number.match(/(.{9})$/g);
          if(result && result.length>0){
            phoneContacts.push({
              name: eachContact.displayName,
              phoneNumbers: result[0]
            })
          }
        }
      })
    }
    let userLists = [];

    UserService.getAllUsers((usersData) => {
      if(usersData){
        const getAllKeys = Object.keys(usersData);
        if(getAllKeys){
          getAllKeys.map((eachKey, indexKey)=>{
            if(this.props.user.Key==eachKey) return true;
            let detailUser = usersData[eachKey];
            if(detailUser && detailUser.Phone){
              var findPhone = detailUser.Phone.match(/(.{9})$/g);
              if(findPhone && findPhone.length>0){
                let filterPhoneNum = _.filter(phoneContacts, {phoneNumbers: findPhone[0]})[0];
                if(filterPhoneNum){
                    let filterFriendsKey = _.filter(this.friendsAndFriendsRequestData, {key: detailUser.key})[0];
                    if(filterFriendsKey){
                        let mergeUserObject = {...detailUser, ...filterFriendsKey};
                        userLists.push(mergeUserObject);
                    }else{
                      let mergeUserObject = {...detailUser, ...{relationship: 'inviter'}};
                      userLists.push(mergeUserObject);
                    }
                }
                if(indexKey == getAllKeys.length-1){
                  this.tempUserLists = userLists;

                  this.setState({userLists: userLists});
                }
              }
            }
          })
        }
      }
    })

    this.keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", this.keyboardDidHide);
  }

  keyboardDidShow = e => {
    this.setState({ statusKeyboard: true });
  };

  keyboardDidHide = e => {
    this.setState({ statusKeyboard: false });
  };

  onPressProfile = (eachFriend)=>{
    this.setState({selectedUser: eachFriend, isPopUpVisible: true});
  }

  handleListFriends = (eachFriend, index)=>{
  let filterUser = _.filter(this.invited_users_as_friend, {Key: eachFriend.Key})[0]
  let newEachFriend = eachFriend;
  if(filterUser){
    newEachFriend = {...eachFriend, ...{relationship: 'invited'}};
  }

    return(
        <View key={`View_Top_${index}`} style={SearchListStyle.listItem}>
            <TouchableOpacity onPress={()=>this.onPressProfile(eachFriend)} style={{width: '15%'}}>
                <Image placeholderColor={'#afafaf'}
                    style={[ApplicationStyles.radioAvatar, {
                        borderRadius: 25,
                        borderWidth: 1,
                        width: 50,
                        height: 50}]}
                    resizeMode="contain"
                    source={{ uri: newEachFriend.Avatar }}/>
              </TouchableOpacity>

            <View style={[SearchListStyle.secondColumn, {width: '50%'}]}>
                <Text key={`Text${index}_${newEachFriend.Name}`} style={[SearchListStyle.listItemText, {left: 5}]}>{newEachFriend.Name}</Text>
            </View>
            {
              newEachFriend.relationship=="friend"?
                <View style={[SearchListStyle.thirdColumn, {flexDirection: 'row', width: '35%', backgroundColor: '#EBEBF2'}]}>
                    <Ionicons name="ios-send" size={20} />
                    <Text style={{ color: 'black' }}>  {Translator.t('common.friends')}</Text>
                </View>
              :
              newEachFriend.relationship=="invited"?
                <View style={[SearchListStyle.thirdColumn, {flexDirection: 'row', width: '35%', backgroundColor: '#EBEBF2'}]}>
                    <Ionicons name="ios-send" size={20} />
                    <Text style={{ color: 'black' }}>  {Translator.t('common.invited')}</Text>
                </View>
              :
                <TouchableOpacity onPress={()=>this.inviteFriend(newEachFriend)} style={[SearchListStyle.thirdColumn,{width: '35%'}]}>
                  <Text style={{ color: 'white' }}> + {Translator.t('common.invite')}</Text>
                </TouchableOpacity>
            }
        </View>
    )
  }

  inviteAllFriends = ()=>{
    const { userLists } = this.state
    let filterFriendInviter = _.filter(userLists, {relationship: 'inviter'});
    if(filterFriendInviter && filterFriendInviter.length>0){
      this.invited_users_as_friend = [];
      filterFriendInviter.map((eachFilterFriend)=>{
        let mergeFilterFriendObj = {...eachFilterFriend, ...{relationship: 'invited'}};
        this.invited_users_as_friend.push(mergeFilterFriendObj);
      })
      this.setState({userLists: [...userLists]});
    }
  }

  uniqueValue = (data)=>{
    return data.filter((v, i, a) => a.indexOf(v) === i);
  }
  
  inviteFriend = (eachFriend)=>{
    let {userLists} = this.state
    this.invited_users_as_friend.push(eachFriend);
    this.setState({userLists: [...userLists]});
    // this.setState({searchText: this.state.searchText});
  }

  handleClearSearch = ()=>{
    this.setState({searchText: '', userLists: [...this.tempUserLists]});
  }

  handleSearchFriends = (searchText) => {
    let {userLists} = this.state;
    if(searchText){
      let userListsFilter = userLists.filter(function (data) {
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
      this.setState({ userLists: [...userListsFilter], searchText });
    }else{
      this.setState({ userLists: [...this.tempUserLists], searchText });
    }
  }


  onPressDone = () => {
    this.setState({ statusLoading: true });
    if(this.invited_users_as_friend && this.invited_users_as_friend.length> 0){
      UserService.sendFriendRequests(this.props.user.Key, this.invited_users_as_friend, () => {
        setTimeout(() => {
          // this.goNext()
          this.setState({ statusLoading: false });
            this.props.navigation.navigate('FindGroupScreen')
        }, 3000)
      })
    }else{
      setTimeout(() => {
        // this.goNext()
        this.setState({ statusLoading: false });
          this.props.navigation.navigate('FindGroupScreen')
      }, 3000)
    }
  }

  render(){
    const { userLists, statusKeyboard, searchText } = this.state
    return(
      <View style={styles.container}>
      {
        Functions.loading(this.state.statusLoading)
      }
      <ScrollView style={[styles.listContainer, { height: '100%', padding: 20 }]}>
          <View style={[styles.innerContainer, {padding: 0}]}>
              <Text style={styles.titleText}>{Translator.t('find_friends.title')}</Text>
              <Text style={styles.paragraph}>{Translator.t('find_friends.subtitle', {
                app_name: AppConfig.appName
              })}</Text>
          </View>

          <View style={SearchListStyle.newsearchBar}>
            <View style={{width: "12.5%", alignItems:'center',justifyContent:'center'}}>
              <Icon
                name="search"
                size={26}
                color="#C8C7CD"
              />
            </View>
           
            <View style={SearchListStyle.searchInputContainer}>
              <TextInput style={SearchListStyle.searchInput}
                placeholder={'Rechercher autour de vous'}
                autoCapitalize='none'
                selectionColor={Colors.mainColor}
                value={searchText}
                onChangeText={(searchText) => this.handleSearchFriends(searchText)} 
                />
            </View>
            <TouchableOpacity style={{width: "12.5%", alignItems:'center',justifyContent:'center'}} onPress={this.handleClearSearch}>
              <Icon
                name="cancel"
                size={26}
                color="#C8C7CD"
              />
            </TouchableOpacity>
            
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', marginTop: 20, marginBottom: 20}}>
              <View style={{}}>
    <Text style={{fontSize:15,color:Colors.mainColor}}>{userLists.length} {userLists.length>1?'Contacts':'Contact'}</Text>
              </View>
              <TouchableOpacity onPress={this.inviteAllFriends}>
                <View style={SearchListStyle.button}>
                    <Text style={{color: Colors.mainColor}}>Inviter Tous</Text>
                </View>
              </TouchableOpacity>
          </View>
          
            {
              userLists.map((eachFriend, index)=>{
                return(
                  this.handleListFriends(eachFriend, index)
                )
              })
            }

        <View style={{paddingTop: 120}}>
        </View>

      </ScrollView>

      {
          this.state.selectedUser ?
            <UserPopUp
              user={this.state.selectedUser}
              isVisible={this.state.isPopUpVisible}
              onClose={() => this.setState({ isPopUpVisible: false })} />
            : null
        }

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

export default connect(mapStateToProps, mapDispatchToProps)(FindFriendsScreen)
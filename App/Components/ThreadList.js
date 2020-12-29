import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Styles/ThreadListStyle'
import UserService from '../Services/User'
import FirebaseService, { handleError } from '../Services/Firebase'
import NotificationList from './NotificationList'
import { Images, Fonts, Colors, Metrics } from '../Themes'
import { SkypeIndicator } from 'react-native-indicators'

import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Image,
    ScrollView
} from 'react-native';

import UserPictureComponent from './UserPicture'
import GroupPicture from './GroupPicture'
import Message from './Message'
import Translator from '../Translations/Translator'
import Time from '../Services/Time'
import StringUtil from '../Lib/StringUtil'

const databaseRef = FirebaseService.database();

export default class ThreadList extends Component {

    static propTypes = {
        onPress: PropTypes.func.isRequired,
        user: PropTypes.object.isRequired,
        handlePressUserOnMap: PropTypes.func,
    }

    state = { chatrooms: [], refreshing: true, isPopUpVisible: false};

    componentWillMount() {
        this.isCancelled = false;
        this.loadChatrooms();
    }

    componentWillUnmount() {
        this.isCancelled = true;
        if(this.dbRef) this.dbRef.off('value')
    }

    loadChatrooms() {
        if(!this.props.user || !this.props.user.Key) return

        if(!this.state.refreshing) this.setState({refreshing: true})

        this.dbRef = databaseRef.ref('/chatrooms/users')
                                .child(this.props.user.Key)
                                .orderByChild('updatedAt')

        this.dbRef.on('value', snapshot => {

            if(!snapshot.exists()) return this.setState({refreshing: false})

            if(this.isCancelled) return;

            let chatrooms = []
            let requests = []

            snapshot.forEach((childSnapshot)=> {

                if(!childSnapshot.exists()) return;
                if(!childSnapshot.val().users) return;

                requests.push(this.getChatroomFromSnapshot(childSnapshot, (chatroom) => {

                    if(!chatroom) return

                    chatrooms.push(chatroom)
                }))
            })

            Promise.all(requests).then(() => {
                this.setState({chatrooms: this.sortChatrooms(chatrooms), refreshing: false,})
            })
        })
    }

    async getChatroomFromSnapshot(childSnapshot, callback) {

      var chatroom = {...childSnapshot.val(), key: childSnapshot.key};

      if(!chatroom.name) return callback()
    
      let audio = await this.getChatRoomLastAudio(chatroom)

      let user = null

      let userKey = chatroom.users.find(key => key != this.props.user.key)

      user = await databaseRef.ref('/users')
                        .child(userKey)
                        .once('value')

      user = {...user.val(), key: user.key, Key: user.key}

      const isBlocked = await UserService.isUserBlocked(this.props.user.key, user.key)

      if(chatroom.users.length == 2 && isBlocked) return callback()

      if(this.isCancelled) return callback()

      return callback({
        ...chatroom,
        audio,
        user
      })
  }

  sortChatrooms(chatrooms) {
    chatrooms = chatrooms.sort((chatroomA, chatroomB) => {

        if(chatroomA.updatedAt == null) return -1;
        if(chatroomB.updatedAt == null) return 1;

        if(chatroomB.updatedAt < chatroomA.updatedAt) return -1;

        return 1;
    });

    return chatrooms
  }

  async getChatRoomLastAudio(chatroom) {
      if(chatroom.lastMessage == null) return

      let snapshot = await databaseRef.ref('/messages/' + chatroom.key)
      .child(chatroom.lastMessage)
      .once('value')

      return snapshot.val() ? snapshot.val() : {}
  }

  onPress(user, chatroom) {
    return this.props.onPress(user, chatroom);
  }

  renderGroupInfo(chatroom) {
      return <View style={{flex: 1, marginHorizontal: 5, marginTop: 5, flexDirection: 'row', alignItems: 'center'}}>
            <Image source={Images.users} style={[styles.smallImage, {marginBottom: 2}]} resizeMode='contain' />
            <Text style={[styles.round, {backgroundColor: Colors.disabled, width: 4, height: 4, marginHorizontal: 6}]}> </Text>
            <Text style={[Fonts.style.description, {color: Colors.disabled}]}>{chatroom.users.length}</Text>
        </View>
  }

  renderGroupImage(chatroom, user, index) {

    return <GroupPicture
            groupPic={user.Avatar}
            key={'GroupPicture_' + index}
            groupStatus={user.status}
            userPic={chatroom.user ? chatroom.user.Avatar : null}
            userStatus={chatroom.user ? chatroom.user.status : null}
            onPress={() => this.onPress(user, chatroom)}
            />
  }

  renderChatRoom(chatroom, index) {
    let user = chatroom.user

    if(chatroom.groupID) user = { Name: chatroom.name, Avatar: chatroom.image, key: chatroom.user ? chatroom.user.Key : chatroom.key, status: chatroom.status}

    if(chatroom.key) index = chatroom.key

    return (
        <View key={'View_Container' + index}>
            <TouchableOpacity onPress={() => this.onPress(user, chatroom)}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{marginTop: 10, flex: 0.2}} key={'user_view_' + index}>
                        {
                            chatroom.groupID ?
                              this.renderGroupImage(chatroom, user, index)
                              :
                              <UserPictureComponent
                                  key={'user_chatroom_picture_' + index}
                                  onPress={(user)=>this.props.handlePressUserOnMap(user)}
                                //   onPress={() => this.setState({selectedUser: user, isPopUpVisible: true})}
                                  user={user}/>
                        }
                    </View>
                    <View style={[styles.messageInfoContainer, {flex: 0.7}]}>
                      <View style={{flex: 1,flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 0, marginTop: 10}}>
                          <Text style={styles.textBigInfo}>{StringUtil.trim(user.Name, 20)}</Text>
                          {
                              chatroom.groupID ?
                                  this.renderGroupInfo(chatroom)
                              : null
                          }
                      </View>
                      <View style={{flex: 1,flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={[styles.textMediumInfo, {color: Colors.disabled}]}>{chatroom.audio ? Time.formatMessage(chatroom.audio.createdAt) : null}</Text>
                          {
                              chatroom.audio && chatroom.audio.createdAt && chatroom.nbUnreadMessages ?
                                  <Text style={[styles.round, {backgroundColor: Colors.disabled, width: 4, height: 4, marginHorizontal: 6, alignSelf: 'center'}]}> </Text>
                              : null
                          }
                          {
                              chatroom.nbUnreadMessages ?
                                  <Text style={ styles.textMediumInfo, {color: Colors.mainColor}}>
                                      {chatroom.nbUnreadMessages ? chatroom.nbUnreadMessages : 0} {Translator.t('common.messages', { count: chatroom.nbUnreadMessages ? chatroom.nbUnreadMessages : 0 })}
                                    </Text>
                              : null
                          }
                      </View>

                    </View>
                    <View style={styles.lastColumn}>
                      <View style={[styles.round, {backgroundColor: chatroom.nbUnreadMessages && chatroom.nbUnreadMessages > 0 ? Colors.mainColor :null}]}></View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
  }

  render(){
        return(
          <ScrollView style={{flex: 1}}>
              <NotificationList user={this.props.user}/>
              {
                this.state.refreshing ?
                    <View style={styles.containerSearchIcon}>
                      <SkypeIndicator color={Colors.mainColor} size={26} style={{ alignSelf: 'center' }} />
                    </View>
                : null
              }

              <FlatList
                  style={styles.container}
                  data={this.state.chatrooms}
                  keyExtractor={(item, index) => index.toString() + '_' + this.props.recordsSource}
                  ListFooterComponent={() => <View style={{height: 120}}/>}
                  ListHeaderComponent={() => <View style={{height: 0}}/>}
                  renderItem={({ item, index }) => this.renderChatRoom(item, index)}
                  >
              </FlatList>
          </ScrollView>
      );
  }
}

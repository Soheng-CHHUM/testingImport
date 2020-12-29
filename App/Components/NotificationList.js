import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import styles from './Styles/NotificationListStyle'
import { Colors, Images, Metrics } from '../Themes'
import { SkypeIndicator } from 'react-native-indicators'
import FirebaseService from '../Services/Firebase'
import AntDesign from 'react-native-vector-icons/AntDesign'
import UserPicture from './UserPicture'
import GroupPicture from './GroupPicture'

import TimeService from '../Services/Time';
import UserService from '../Services/User'
import GroupService from '../Services/GroupService'

import Chatroom from '../Models/Chatroom'

export default class NotificationList extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      user: props.user,
      isVisible: false,
      isAccepted: false,
      refreshing: false,
      lastNotification: null,
      requestAnswers: {},
    }
  }

  componentDidMount() {
    this.loadNotifications(this.props.user)
  }

  componentWillReceiveProps(props) {
    if(props.user && this.props.user && props.user.nbNotifications != this.props.user.nbNotifications) {
      return this.setState({refreshing: true, notifications: [], lastNotification: null}, () => this.loadNotifications(props.user))
    }

    this.loadNotifications(props.user)
  }

  loadNotifications(user) {
    if(!user || this.loading || (user.nbNotifications && this.state.notifications.length >= user.nbNotifications)) {
      this.loading = false
      return this.setState({refreshing: false})
    }

    this.loading = true

    this.dbRef = FirebaseService.database()
      .ref(`/notifications/${user.key}`)
      .orderByChild('order')

    if(this.state.lastNotification) this.dbRef = this.dbRef.startAt(this.state.lastNotification.order)

    this.dbRef = this.dbRef.limitToFirst(10);

    this.dbRef.once('value', snaps => {

      let notifications = []

      snaps.forEach(notifSnap => {
        notifications.push({
          ...notifSnap.val(),
          key: notifSnap.key
        })
      })

      notifications = notifications.filter(notif => {
        return this.state.notifications.find(notif2 => notif2.key == notif.key) == null
      })

      this.loading = false

      notifications = this.state.notifications.concat(notifications)
      notifications = this.sortNotifications(notifications)
      this.setState({notifications, lastNotification: notifications[notifications.length-1], refreshing: false})
    })
  }

  sortNotifications(notifications) {

    let sortedNotifications = notifications.sort((notifA, notifB) => {

        if(notifA.createdAt == null) return -1;
        if(notifB.createdAt == null) return 1;

        if(notifB.createdAt < notifA.createdAt) return -1;

        return 1;
    });

    return sortedNotifications
  }

  openNotification = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  }

  rejectRequest(request) {
    let requestAnswers = this.state.requestAnswers

    requestAnswers[request.key] = {
      answer: false
    }

    let notifications = this.state.notifications.filter(not => {
      return not.key != request.key
    })

    this.removeNotification(request)

    this.setState({
      requestAnswers,
      notifications
    });
  }

  acceptRequest(request, body) {

    let requestAnswers = this.state.requestAnswers

    requestAnswers[request.key] = {
      answer: true
    }

    let notifications = this.state.notifications.map(not => {
      if(not.key != request.key) return not

      return {
        ...not,
        body
      }
    })

    this.removeNotification(request)

    this.setState({
      requestAnswers,
      notifications
    });
  }

  rejectFriendRequest = (request) => {

    this.rejectRequest(request)

    UserService.rejectFriendRequest(this.props.user.key, request.data.senderKey, () => {
    })
  }

  acceptedFriendRequest = (request) => {

    this.acceptRequest(request, 'Est votre ami maintenant')

    FirebaseService.database()
      .ref(`/users/${request.data.senderKey}`)
      .once('value', snap => {
        if(!snap.exists()) return

        let friend = {
          ...snap.val(),
          key: snap.key
        }

        UserService.acceptFriendRequest(this.props.user.key, friend, (status, err) => {
          /*FirebaseService.database()
            .ref(`/notifications/${this.props.user.key}/${request.key}`)
            .update({
              body: 'Est votre ami maintenant',
              answered: true
            })*/

            UserService.createChatRoom(new Chatroom({
              users: [
                this.props.user.key,
                friend.key
              ],
              createdBy: this.props.user.key
            }), (room, err) => {})
        })
      })
  }

  isNotificationAnswered(notification) {
    return this.getNotificationAnswer(notification) != null
  }

  getNotificationAnswer(notification) {
    if(this.state.requestAnswers[notification.key]) return this.state.requestAnswers[notification.key].answer

    return notification.answered
  }

  acceptGroupRequest(request) {
    const groupName = request.data.groupName

    this.acceptRequest(request, `Est maintenant membre du groupe ${groupName}`)

    GroupService.acceptRequest(request.data.senderKey, request.data.requestKey, () => {

      FirebaseService.database().ref(`/groups/${request.data.requestKey}`)
        .once('value', snap => {
          let users = snap.val().users

          if(users.find(key => key == request.data.senderKey) == null) users.push(request.data.senderKey)

          UserService.createChatRoom(new Chatroom({
            groupID: snap.key,
            users,
            createdBy: this.props.user.key
          }), (room, err) => {})
        })
    })
  }

  rejectGroupRequest(request) {
    this.rejectRequest(request)

    GroupService.rejectRequest(request.data.senderKey, request.data.requestKey, () => {})
  }

  removeNotification(notification) {
    return FirebaseService
            .database()
            .ref(`/notifications/${this.props.user.key}`)
            .child(notification.key)
            .remove()
  }

  renderGroupRequest(notification, index) {
    let content = notification.body ?
      notification.body.replace(notification.data.groupName, '')
      : ''

    if(this.getNotificationAnswer(notification) == false) return <View></View>

    return <View index={`Container_${notification.key}`} style={styles.confirmation}>
      <View style={styles.reqAvatar}>

      <GroupPicture
        groupPic={notification.image && notification.image.group ? notification.image.group : null}
        groupStatus={null}
        userPic={notification.image && notification.image.user ? notification.image.user : null}
        userStatus={null}
        onPress={() => {}}
      />
      </View>


      <View style={styles.notiDesc}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, color: 'black' }}>{notification.title}</Text>
          <Text style={styles.txtTime}>{TimeService.formatMessage(notification.createdAt)}</Text>
        </View>

        {
          this.isNotificationAnswered(notification) ?
            <View style={{flexDirection: 'column'}}>
              <Text style={{ fontSize: 15, color: '#8F8F94' }}>{content} </Text>
              <Text style={{ fontSize: 15, color: Colors.secondColor }}>{notification.data.groupName}.</Text>
            </View>
          :
          <View style={{flexDirection:notification.data.groupName.length>10?'column':'row'}}>
            <Text style={{ fontSize: 15, color: 'black' }}>{content}</Text>
            <Text style={{ fontSize: 15, color: Colors.secondColor }}>{notification.data.groupName}.</Text>
          </View>
        }

        {
          this.isNotificationAnswered(notification) ? null :
            <View style={styles.btnConfirm}>
              <TouchableOpacity onPress={() => this.acceptGroupRequest(notification)} style={[styles.button, { backgroundColor: '#B360D2' }]}>
                <Text style={{ fontSize: 15, color: 'white' }}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.rejectGroupRequest(notification)} style={[styles.button, { backgroundColor: '#E4E4E4' }]}>
                <Text style={{ fontSize: 15, color: 'black' }}>Refuser</Text>
              </TouchableOpacity>
            </View>
        }
      </View>
    </View>
  }

  renderFriendRequest(notification, index) {

    if(this.getNotificationAnswer(notification) == false) return <View></View>

    return <View index={`Container_${notification.key}`} style={[styles.confirmation, { marginTop: 10}]}>
      <View index={`AvatarContainer_${notification.key}`} style={styles.reqAvatar}>
        <UserPicture
            onPress={() => {}}
            user={{
              key: notification.data.senderKey,
              avatar: notification.image,
              status: null
            }}
            appUser={this.props.user} />
      </View>
      <View style={styles.notiDesc}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, color: 'black' }}>{notification.title}</Text>
          {
            this.isNotificationAnswered(notification) ? null :
              <Text style={styles.txtTime}>{TimeService.formatMessage(notification.createdAt)}</Text>
          }
        </View>
        <Text style={{ fontSize: 15, color: '#8F8F94' }}>{notification.body}</Text>

        {
          this.isNotificationAnswered(notification) ? <View style={{marginBottom: 10}}></View> :
            <View style={styles.btnConfirm}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#B360D2' }]}
                onPress={() => this.acceptedFriendRequest(notification)}
              >
                <Text style={{ fontSize: 15, color: 'white' }}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.rejectFriendRequest(notification)}
                style={[styles.button, { backgroundColor: '#E4E4E4' }]}>
                <Text style={{ fontSize: 15, color: 'black' }}>Refuser</Text>
              </TouchableOpacity>
            </View>
        }

      </View>
    </View>
  }

  renderNotification(notification, index) {

    switch(notification.type) {
      case 'group-access':
        return this.renderGroupRequest(notification, index)
      case 'friend-request':
          return this.renderFriendRequest(notification, index)
    }

    return <View></View>
  }

  render() {
    const { isVisible } = this.state
    return (
      <ScrollView scrollEnabled={true} contentContainerStyle = {{ flex: 1 }}>
      {/* --------------Notification-------------- */}
      <TouchableOpacity style={isVisible ? [styles.notification, { backgroundColor: 'white' }] : styles.notification} onPress={this.openNotification}>
        <View style={styles.notiNum}>
          <Text style={{ fontSize: 15, color: 'white' }}>{this.props.user && this.props.user.nbNotifications ? this.props.user.nbNotifications : 0}</Text>
        </View>
        <View style={styles.notiDesc}>
          <Text style={{ fontSize: 22, color: 'black' }}>{this.props.user.nbNotifications>1?'Notifications':'Notification'}</Text>
          <Text style={{ fontSize: 15, color: '#8F8F94' }}>Voir tous</Text>
        </View>
        <AntDesign name={isVisible ? 'up' : 'down'} size={20} color='#B360D2' style={{ position: 'absolute', right: 0, marginRight: 28 }} />
      </TouchableOpacity>

      {
        isVisible ?
        <TouchableOpacity>
          <FlatList
          scrollEnabled={false}
          contentContainerStyle = {{ flex: 1 }}
          refreshing={this.state.refreshing}
          data={this.state.notifications}
          // this.props.user.nbNotifications
          // style={{ height:this.props.user.nbNotifications==undefined?40:'20%'}}
          // contentContainerStyle={{ backgroundColor:'#e2e2e2'}}
          ListEmptyComponent={() => <View style={[styles.confirmation, {alignItems: 'center', flexDirection: 'column'}]}><Text style={{ fontSize: 15, color: '#8F8F94', alignSelf: 'center' }}>{this.props.user.nbNotifications>0?'Aucune notifications':'Aucune notification'}</Text></View>}
          ListFooterComponent={() => <View style={{height: 10}}/>}
          ListHeaderComponent={() => <View style={{height: 10}}/>}
          onRefresh={() => this.setState({refreshing: true, notifications: [], lastNotification: null}, () => this.loadNotifications(this.props.user))}
          onEndReached={() => this.setState({refreshing: true}, () => this.loadNotifications(this.props.user))}
          onEndReachedThreshold={0.2}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => this.renderNotification(item, index)}
          ></FlatList>
          </TouchableOpacity>
        : null

      }
</ScrollView>
    );
  }
}

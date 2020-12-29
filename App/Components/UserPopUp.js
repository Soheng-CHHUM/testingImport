import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog';
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { SkypeIndicator } from 'react-native-indicators'
import styles from './Styles/UserPopUpStyle'
import { ApplicationStyles, Metrics, Colors, Images } from '../Themes'
import Chatroom from '../Models/Chatroom'
import FirebaseService from '../Services/Firebase'
import UserService from '../Services/User'
import ThreadActions from '../Redux/ThreadRedux'
import Searcher from '../Services/Searcher'
import _ from 'lodash'
class UserPopUp extends Component {
  // // Prop type warnings
  static propTypes = {
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onBlockUser: PropTypes.func,
    onMessagePrivate: PropTypes.func,
  }

  constructor(props) {
    super(props)

    this.state = {
      isVisible: props.isVisible ? props.isVisible : false,
      user: props.user ? props.user : null,
      selectedIndex: 0,
      friendsAndFriendsRequestData: null
    }

    this.isLoaded = false
  }

  componentDidMount() {
    this.load(this.props.user);
    this.filterFriendsAndFriendsRequest();
  }

  filterFriendsAndFriendsRequest = ()=>{
    Searcher.filterFriendsAndFriendsRequest(this.props.appUser.Key, (snapshot) => {
      this.setState({friendsAndFriendsRequestData: snapshot});
    });
  }

  componentWillReceiveProps(props) {
    if (props.user) {
      let isUserHasChanged = this.state.user == null || this.state.user.key != props.user.key
      if (isUserHasChanged) this.load(props.user)
    }
    else if (this.state.user) {
      this.setState({ user: null })
    }

    if (props.isVisible != this.state.isVisible) {
      this.filterFriendsAndFriendsRequest();
      if (props.isVisible && this.state.user) this.loadFriends(this.state.user).then(() => this.setState({ isVisible: props.isVisible }))
      else this.setState({ isVisible: props.isVisible })
    }
  }

  load(curUser) {

    if (!curUser || !this.props.appUser || !this.props.friends || this.isLoading) return

    this.isLoading = true

    FirebaseService.database().ref(`/users/${curUser.key}`)
      .once('value', snapUser => {

        if (!snapUser.exists()) return

        let user = {
          ...snapUser.val(),
          key: snapUser.key
        }

        this.loadFriends(user).then(() => this.isLoaded = true)
      })
  }

  async loadFriends(user) {
    const snapUserFriends = await FirebaseService.database()
      .ref(`/friends/${user.key}`)
      .once('value')

    const snapReport = await FirebaseService.database()
      .ref(`/reports/${this.props.appUser.key}/${user.key}`)
      .once('value')

    const appUserFriends = this.props.friends ? this.props.friends : {}

    user.isFriend = appUserFriends[user.key] != null
    user.isReported = snapReport.exists()
    user.nbCommonFriends = 0
    user.friends = {}

    if (!user.isFriend) {
      const inviteFriendSnap = await FirebaseService.database()
        .ref(`/friends-requests/${this.props.appUser.key}/sent/${user.key}`)
        .once('value')

      user.isInviteSent = inviteFriendSnap.exists()
    }

    snapUserFriends.forEach(snapFriend => {
      if (appUserFriends[snapFriend.key]) user.nbCommonFriends++
      user.friends[snapFriend.key] = {
        ...snapFriend.val(),
        key: snapFriend.key
      }
    })

    this.isLoading = false
    return this.setState({
      // user //penh code
      user:this.props.user
    })
  }

  isVisible() {
    return this.state.isVisible
  }

  close() {
    this.props.onClose();
    this.setState({ isVisible: false })
  }

  blockUser() {
    UserService.blockUser(this.props.appUser.key, this.state.user.key)
    if (this.props.onBlockUser) this.props.onBlockUser(this.state.user.key)
    this.close()
  }

  alertUser() {
    UserService.reportUser(this.props.appUser.key, this.state.user.key, () => this.close())
  }

  sendMessage() {
    UserService.createChatRoom(new Chatroom({
      users: [
        this.props.appUser.key,
        this.state.user.key
      ],
      createdBy: this.props.appUser.key
    }), (chatroom) => {
      this.props.onMessagePrivate(this.props.user, chatroom);
      this.close();
      this.props.setCurrentThread(chatroom.key);
    })
  }

  sendFriendRequest() {
    UserService.sendFriendRequests(this.props.appUser.key, [this.state.user], () => {
      this.close()
    })
  }

  inviteUserToPremium(userToInviteKey){
    UserService.inviteUserToPremium(userToInviteKey, () => {
      this.close()
    })
  }

  unfriend() {
    UserService.unfriend(this.props.appUser.key, {
      key: this.state.user.key
    }, () => this.close())
  }

  renderLoadingContent() {
    return (
      <DialogContent style={{ marginBottom: -10, flex: 1 }}>
        <View style={[styles.containerSearchIcon, { flex: 1 }]}>
          <SkypeIndicator color={Colors.mainColor} size={26} style={{ alignSelf: 'center' }} />
        </View>
      </DialogContent>
    )
  }

  renderNoPremium() {
    return (
      <Dialog
        onDismiss={() => {
          this.close()
        }}
        onTouchOutside={() => {
          this.close()
        }}
        width={Metrics.screenWidth}
        visible={this.isVisible()}
        dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
        containerStyle={{ padding: 0, margin: 0 }}
        dialogStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent', position: 'absolute', bottom: 0 }}
      >
        {
          this.state.user ?
            (
              <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: this.state.user.Avatar }} style={styles.imgAvatarRound} />
                <DialogContent style={{ marginBottom: -10 }}>
                  <View style={styles.menuList}>
                    <TouchableOpacity style={styles.menuItem}>
                      <Text style={{ color: '#B360D2', fontSize: 22, fontWeight: 'bold' }}>{this.state.user.Name}</Text>
                    </TouchableOpacity>
                    <View style={styles.verticalLine} />



                    <TouchableOpacity onPress={() => this.blockUser()} style={styles.menuItem}>
                      <Text style={styles.textButton}>Bloquer ce profil</Text>
                    </TouchableOpacity>
                    <View style={styles.verticalLine} />
                    <TouchableOpacity onPress={() => this.alertUser()} style={styles.menuItem}>
                      <Text style={styles.textButton}>Signaler ce profil</Text>
                    </TouchableOpacity>
                  </View>
                </DialogContent>
                <TouchableOpacity
                  onPress={() => {
                    this.close()
                  }}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: 'white',
                      width: Metrics.screenWidth - 20,
                      borderRadius: 10,
                      marginBottom: 15
                    }]}>
                  <Text style={{ fontSize: 20 }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : this.renderLoadingContent()
        }
      </Dialog>
    )
  }

  renderPremium() {
    var filterIDExisting = null
    filterIDExisting = _.filter(this.state.friendsAndFriendsRequestData, {key: this.state.user.key})[0]
    const makeMenuItem = (text, index, onPress) => {
      return <View>
        <TouchableOpacity onPress={() => this.setState({ selectedIndex: index }, () => onPress())} style={styles.menu}>
          <Text style={this.state.selectedIndex == index ? styles.txtMenuSelected : styles.txtMenu}>
            {text}
          </Text>
          <AntDesign name='right' size={18} style={styles.iconMenu} />
        </TouchableOpacity>
        <View style={styles.horizontalLine} />
      </View>
    }

    const items = [
      {
        render: (index) => filterIDExisting && filterIDExisting.relationship=="friend"?
          makeMenuItem('Envoyer un message privé', index, () => this.sendMessage())
          : filterIDExisting && filterIDExisting.relationship=="invited" ?
            makeMenuItem('Demande d\'ami envoyée', index, () => { })
            : makeMenuItem('Demander en ami', index, () => this.sendFriendRequest())
      },
      {
        render: (index) => this.state.user.isPremium ?
            null
          : makeMenuItem('Inviter', index, () => this.inviteUserToPremium(this.state.user.Key))
      },
      {
        render: (index) => this.state.user.isReported ?
          makeMenuItem('Profil déjà signalé', index, () => { })
          :
          makeMenuItem('Signaler ce profil', index, () => this.alertUser())
      },
      {
        render: (index) => makeMenuItem('Bloquer ce profil', index, () => this.blockUser())
      },
      {
        render: (index) => this.state.user.isFriend ?
          makeMenuItem('Enlever de la liste d\'amis', index, () => this.unfriend())
          : null
      }

    ]

    return (
      <Dialog
        onDismiss={() => {
          this.close();
        }}
        onTouchOutside={() => {
          this.close();
        }}
        width={Metrics.screenWidth}
        rounded={false}
        visible={this.isVisible()}
        dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
        dialogStyle={[styles.dialogPremium, { borderRadius: Metrics.popUpRadius }]}
      >
        <View style={[ApplicationStyles.topLine, { backgroundColor: '#3C3C3C' }]} />

        <TouchableOpacity onPress={() => this.close()} style={styles.crossButton}>
          <Ionicons name='md-close-circle' size={38} color='#8F8F94' />
        </TouchableOpacity>

        {

          this.state.user ?
            (
              <DialogContent style={styles.premiumContainer}>
                <ScrollView>
                  <View style={styles.profileContainer}>
                    <View style={styles.imgContainer}>
                      <Image source={{ uri: this.state.user.Avatar }} style={styles.imgProfile} />
                    </View>
                    <View style={styles.profileText}>
                      <Text style={styles.txtName1}>{this.state.user.Name}</Text>
                      <Text style={{ fontSize: 15, color: 'white' }}>Groupes: {this.state.user.nbGroups ? this.state.user.nbGroups : 0}</Text>
                      <Text style={{ fontSize: 15, color: 'white' }}>Amis en commun : {this.state.user.nbCommonFriends ? this.state.user.nbCommonFriends : 0}</Text>
                    </View>
                  </View>

                  <View style={[styles.horizontalLine, { marginTop: 20 }]} />
                  {
                    this.state.user.isPremium ? null :
                      (<View>
                        <Text style={{ fontSize: 16, color: 'white', marginVertical: 15, textAlign: 'center' }}>
                          Malheureusement cet utilisateur n’est pas {"\n"}en version Premium, invitez le à passer {"\n"}Premium pour communiquer avec lui.
                        </Text>
                        <View style={styles.horizontalLine} />
                      </View>)
                  }

                  {
                    items.map((item, index)=>{
                      if(index==0 && !this.state.user.isPremium) return false;
                      return item.render(index);
                    })
                  }

                  <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                    <Image source={Images.white_logo} style={{ width: 100, height: 100, alignSelf: 'center' }} />
                  </View>
                </ScrollView>
              </DialogContent>
            ) : this.renderLoadingContent()
        }
      </Dialog>)
  }

  render() {
    if (!this.props.appUser && !this.isLoaded && this.isVisible()) return <View></View>
    if (!this.props.appUser) return <View></View>

    return this.props.appUser.isPremium ? this.renderPremium() : this.renderNoPremium()
  }
}


const mapStateToProps = (state) => {
  return {
    appUser: state.auth.user,
    friends: state.friends.data
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentThread: (data) => dispatch(ThreadActions.setThread(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserPopUp)

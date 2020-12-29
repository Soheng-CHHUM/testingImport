import { Platform } from 'react-native'
import { Metrics, Colors } from '../Themes'
import FirebaseService, { handleError } from './Firebase'
import DeviceInfo from 'react-native-device-info'
import _ from 'lodash'
import GeoService, { USERS, ALERTS_ZONE_DE_DANGER, MESSAGES } from './GeoService'
import PhoneToIndex from '../Transforms/PhoneToIndex'
import Chatroom from '../Models/Chatroom'
import { groupBy } from '../Lib/ArrayUtil'
import { ALL } from './Enums/ChatTypes'

export const STATUS_ONLINE = 'online';
export const STATUS_OFFLINE = 'offline';

class UserService {


  getAllUsers(callback){
    return FirebaseService.database().ref('users').orderByChild('Phone').startAt('+').once('value', users => {
      if(users.val()){
        callback(users.val());
      }else{
        callback(null)
      }


    });
  }


  getFriends(userKey, callback){
    var friendsData = [];
    return FirebaseService.database()
    .ref('friends').child(userKey).once('value', friends => {
      if(friends.val()){
        const getAllFriendsKey = Object.keys(friends.val())
        getAllFriendsKey.map((eachFriendRequestKey)=>{
          friendsData.push(friends.val()[eachFriendRequestKey])
        })
        callback(friendsData);
      }else{
        callback(null)
      }


    });
  }

  getUserDetail(userKey, callback){
    FirebaseService.database().ref('users/'+userKey)
      .once('value', (snapshot) => {
          if(snapshot.val()){
            FirebaseService.geofire(`/geo/${USERS}`).get(userKey).then(function(location) {
              var new_location = [0,0];
              if(location){
                new_location = location;
              }
              callback(snapshot.val(), new_location);
            });
          }else{
              callback(null, null);
          }
      });
  }

  registerWithPhoneNumber(userObj, fbcurrentUser, callback) {
    const databaseRef = FirebaseService.database().ref('users');
    let user = {
      ...userObj,
      Uid: fbcurrentUser.uid,
      uid: fbcurrentUser.uid,
      phoneIndex: PhoneToIndex(fbcurrentUser.phoneNumber),
      Phone: fbcurrentUser.phoneNumber,
      usernameToLower: userObj.Name ? userObj.Name.trim().toLowerCase() : userObj.usernameToLower
    }
    user.key = databaseRef.push(user).key
    global.currentUser = user;
    callback(user)
  }
  registerWithEmailPassword(userObj, callback) {
      const databaseRef = FirebaseService.database().ref('users');
      // let user = {
      //   ...userObj,
      //   Uid: firebaseUserData.user.uid,
      //   uid: firebaseUserData.user.uid,
      //   phoneIndex: PhoneToIndex(userObj.Phone),
      //   usernameToLower: userObj.Name ? userObj.Name.trim().toLowerCase() : userObj.usernameToLower
      // }
      // const databaseRef = FirebaseService.database().ref('users');
      // user.key = databaseRef.push(user).key

      // global.currentUser = user

      // callback(user)




    // var credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, code);



    // FirebaseService.auth().signInWithPhoneNumber('+855964231682')
    //   .then((firebaseUserData) => {

    //   }).catch((error) => {
    //     callback(null, error)
    //   })
  }

  loginWithEmailPassword(email, pass, callback) {

    pass = pass.trim()
    email = email.trim()

    FirebaseService.auth().signInWithEmailAndPassword(email, pass)
      .then(function (firebaseUserData) {
        const dbRef = FirebaseService.database().ref('/users');

        dbRef.orderByChild('Email').equalTo(email).limitToFirst(1).once("value", function (data) {

          if (!data.exists()) return callback(null, 'user-not-found')

          let user = null

          data.forEach(snap => {
            user = {
              ...snap.val(),
              uid: firebaseUserData.user.uid,
              Key: snap.key,
              key: snap.key,
              isDeleted: false
            }

            dbRef.child(snap.key).update(user);
          });

          global.currentUser = user

          callback(user)
        })


      }).catch((error) => {
        callback(null, error)
      })
  }

  logout(key, callback) {
    this.setStatus(key, STATUS_OFFLINE);
    FirebaseService.auth().signOut().then(() => {
      callback(true)
    }).catch((error) => callback(false, error));
  }
  /**
   *
   * @param {*} user
   * {
   *    Name: "User name",
   *    Email: "User Email",
   *    Avatar: "User Avatar",
   *    isLogin: null,
   *    isVisible: true,
   *    isGeolocation: true
   * }
   * @param {*} callback (user, error)
   */
  register(user, callback) {

    const databaseRef = FirebaseService.database().ref('users');

    user.usernameToLower = user.Name.toLowerCase();
    user.uid = FirebaseService.auth().currentUser ? FirebaseService.auth().currentUser.uid : null;
    user.phoneIndex = PhoneToIndex(user.Phone);
    databaseRef.orderByChild('Email').equalTo(user.Email).once("value").then(snapshot => {
      if (snapshot.val() == null) {
        databaseRef.push(user)
          .then((data) => {
            user.Key = data.key;
            callback(user);
          })
          .catch((err) => {
            callback(null, err);
          });
      } else {

        snapshot.forEach((child) => {
          user.Key = child.key;
        });

        user.chatrooms = snapshot.val().chatrooms;

        databaseRef.child(user.Key).update(user);
        callback(user);
      }
    });
  }

  hasPropertyChanged(oldUser, newUser) {

    if (oldUser == null && newUser == null) return false;
    if (oldUser == null && newUser != null) return true;

    return oldUser.Avatar != newUser.Avatar ||
      oldUser.Name != newUser.Name;
  }

  getStatusColor(status) {

    switch (status) {
      case STATUS_ONLINE:
        return Colors.online;
    }

    return Colors.offline;
  }

  setStatus(key, status) {

    if(!status) return

    return FirebaseService.database()
      .ref('/users')
      .child(key)
      .once('value', (snaps) => {
        if(!snaps.exists()) return

        return FirebaseService.database()
          .ref('/users')
          .child(key)
          .update({
            status
          });
      })

  }

  getDeviceID() {
    return DeviceInfo.getUniqueID().trim().toLocaleLowerCase();
  }

  reloadThread(user, threadID) {
    return this.updateDevice(user, { currentThread: threadID, lastActionAt: new Date().getTime() });
  }

  updateDevice(user, fields) {

    if (!fields) fields = {}

    fields['uid'] = this.getDeviceID()
    fields['os'] = Platform.OS

    if (!user.key) return

    FirebaseService.database().ref('devices/' + user.key)
      .child(this.getDeviceID())
      .once('value', (snapshot) => {

        if (snapshot.exists()) {

          FirebaseService.database().ref('devices/' + user.key)
            .child(snapshot.key)
            .update(fields)
            .then(() => { })
            .catch((err) => { });
        }
        else {
          FirebaseService.database()
            .ref('devices/' + user.key)
            .child(this.getDeviceID())
            .set(fields)
            .then(() => { })
            .catch((err) => { });
        }
      }).catch((err) => {

      });
  }
  getCurrentThread(user, callback) {
    FirebaseService.database().ref('devices/' + user.Key)
      .orderByChild('uid')
      .equalTo(this.getDeviceID())
      .once('value', (snapshot) => {
        if (snapshot.val() == null) return callback(null);
        var currentThread = null;
        snapshot.forEach((snapshot) => {
          if (snapshot.val().currentThread) return currentThread = snapshot.val().currentThread;
        });
        return callback(currentThread);
      });
  }
  createChatRoom(data: Chatroom, callback) {
    const databaseRef = FirebaseService.database();

    if (groupBy(data.users, (item) => item).size < 1) return callback(null, 'chatroom must have at least 2 users')

    if (data.groupID) {
      databaseRef.ref('/chatrooms')
        .orderByChild('groupID')
        .equalTo(data.groupID)
        .once('value', snaps => {
          let chatroom = { key: null }

          if (snaps.exists()) {

            snaps.forEach((snap) => {
              chatroom = { ...snap.val(), key: snap.key }
            })

            databaseRef.ref(`chatrooms/${chatroom.key}`)
              .update({
                users: data.users
              })

            return callback(chatroom)
          }

          chatroom = { ...data, key: databaseRef.ref('chatrooms').push(data).key }

          return callback(chatroom)
        })
    } else {
      databaseRef.ref('/chatrooms')
        .orderByChild('usersKey')
        .equalTo(data.usersKey)
        .once('value', snaps => {
          let chatroom = {}

          if (snaps.exists()) {

            snaps.forEach((snap) => {
              chatroom = { ...snap.val(), key: snap.key }
            })

            return callback(chatroom)
          }

          chatroom = { ...data, key: databaseRef.ref('chatrooms').push(data).key }

          return callback(chatroom)
        })
    }


  }

  filterInvisibleUsers(curUserKey, users, callback) {
    this.filterUserBlocked(curUserKey, users, (usersFiltered) => {
      let visibleUsers = []

      usersFiltered.map(user => {
        if (user.invisible) return

        visibleUsers.push(user)
      })

      return callback(visibleUsers)
    })
  }

  reportUser(curUserKey, otherUserKey, callback) {
    FirebaseService.database()
      .ref(`/reports/${curUserKey}/${otherUserKey}`)
      .once('value', snap => {
        if (snap.exists()) return callback()

        FirebaseService.database()
          .ref(`/reports/${curUserKey}/${otherUserKey}`)
          .set({
            message: 'reported for some reason'
          })
      })
  }

  blockUser(curUserKey, blockUserKey) {

    var removeDate = new Date();

    removeDate.setDate(new Date().getDate() + 1);

    var blockData = {
      from: curUserKey,
      to: blockUserKey,
      updatedAt: new Date().getTime(),
      removeAt: removeDate.getTime(),
    }

    FirebaseService.database()
      .ref(`/blocks/${curUserKey}`)
      .child(blockUserKey)
      .once("value", (snapshot) => {

        if (snapshot.exists()) return

        FirebaseService.database()
          .ref(`/blocks/${curUserKey}`)
          .child(blockUserKey)
          .set(blockData)
          .then((data) => { })
          .catch((err) => { });

      }, (error) => console.log(error));
  }

  async isUserBlocked(curUserKey, otherUserKey) {
    const blockSnap = await FirebaseService.database().ref(`/blocks/${curUserKey}`)
      .child(otherUserKey)
      .once('value')

    return blockSnap.exists()
  }

  filterUserBlocked(curUserKey, users, callback) {
    let databaseRef = FirebaseService.database();

    if (!curUserKey) return callback([])

    databaseRef.ref('/blocks')
      .child(curUserKey)
      .once('value', (blockSnapshot) => {   // search block users
        var filteredList = users;

        blockSnapshot.forEach((childSnapshot) => {
          if (childSnapshot.val() == null) return;
          let blockedUserID = childSnapshot.key;

          if (filteredList[blockedUserID]) delete filteredList[blockedUserID]
          else if (Array.isArray(filteredList)) filteredList = _.filter(filteredList, function (user) {
            if (typeof user === 'object') return user.key != blockedUserID

            return blockedUserID != user
          });
        });

        let unblockedList = []

        for (var index in filteredList) {
          unblockedList.push(filteredList[index])
        }

        callback(unblockedList);
      }, (error) => handleError(error))
  }

  updateUser(userData) {
    FirebaseService.database().ref('users/' + userData.Key)
      .update(userData)
      .then(() => {
      })
      .catch((err) => { console.log(err) });
  }

  deleteUser(userData) {
    FirebaseService.database().ref('users').child(userData.Key).remove();
  }

  validateAccIsExistingOrNot(uid, callback){
    const dbRef = FirebaseService.database().ref('/users');
    dbRef.orderByChild('uid').equalTo(uid).limitToFirst(1).once("value", function (data) {
      if(data.val() && _.isEmpty(data.val())==false){
        const getUserKey = Object.keys(data.val())[0];
        callback(true, data.val()[getUserKey])
      }else{
        callback(false, null)
      }
    })
  }

  getAvatar(page_no, callback) {
    FirebaseService.database().ref('/avatar')
      .limitToFirst(page_no * 20)
      .once('value', (snapshot) => {
        if (snapshot.val()) {
          removeEmptyVal = snapshot.val().filter(function (e) { return e });
          var getLastAvatarData = removeEmptyVal;
          if (removeEmptyVal.length % 3 == 0) {
            getLastAvatarData = removeEmptyVal;
          } else {
            for (var i = 0; i < 2; i++) {
              getLastAvatarData.push('')
              if (getLastAvatarData.length % 3 == 0) {
                break;
              }
            }
          }
          callback(getLastAvatarData);
        } else {
          callback(null);
        }
      }).then(() => { })
      .catch((err) => { });
  }

  listenMessage(key, recordChannel, messageKey) {
    const httpsCallable = FirebaseService.functions().httpsCallable('listenMessage')

    httpsCallable({
      userKey: key,
      recordChannel,
      messageKey
    }).then(({ data }) => {

    })
  }

  registerLocation(key, location, nbKmLimitZone, callback) {
    GeoService.setLocation(`locations`, key, location, nbKmLimitZone, (status, err) => callback ? callback(status, err) : null)
  }

  removeLocation(key, location, callback) {
    GeoService.removeLocation(`locations`, key, location, (status, err) => callback ? callback(status, err) : null)
  }

  getLocation(key, callback) {
    GeoService.getLocation(`locations`, key, (status, err) => callback ? callback(status, err) : null)
  }


  registerAlertPV(key, location, callback) {
    let alertKey = FirebaseService.database().ref('alerts').push({
      userId: key,
      uid: FirebaseService.auth().currentUser ? FirebaseService.auth().currentUser.uid : null,
    }).key
    GeoService.registerAlertPvLocation(alertKey, location, (status, err) => callback ? callback(status, err) : null)
  }

  removeAlertPV(key, location, callback) {
    FirebaseService.database().ref('alerts').child(key).remove();
    GeoService.removeAlertPv(key, location, (status, err) => callback ? callback(status, err) : null)
  }

  registerAlertZoneDeDanger(key, location, callback) {
    let alertKey = FirebaseService.database().ref(ALERTS_ZONE_DE_DANGER).push({
      userId: key,
      uid: FirebaseService.auth().currentUser ? FirebaseService.auth().currentUser.uid : null,
    }).key
    GeoService.registerAlertZoneDeDangerLocation(alertKey, location, (status, err) => callback ? callback(status, err) : null)
  }

  removeAlertZoneDeDanger(key, location, callback) {
    FirebaseService.database().ref(ALERTS_ZONE_DE_DANGER).child(key).remove();
    GeoService.removeAlertZoneDeDanger(key, location, (status, err) => callback ? callback(status, err) : null)
  }

  removeAlertMessagesZoneDeDanger(key) {
    FirebaseService.database().ref(MESSAGES+'/'+ALL).child(key).remove();
    FirebaseService.database().ref('geo/'+MESSAGES+'/'+ALL).child(key).remove();
  }

  rejectFriendRequest(userKey, friendKey, callback) {
    FirebaseService.database()
      .ref(`/friends-requests/${userKey}/received/${friendKey}`)
      .once('value', snap => {

        if (!snap.exists()) return callback(null, 'snap-not-found')

        return FirebaseService.database()
          .ref(`/friends-requests/${userKey}/received/${friendKey}`)
          .remove()
          .then(() => callback({ ok: true }))
          .catch(err => callback(null, err))
      }).catch(err => callback(null, err))
  }

  acceptFriendRequest(userKey, friend, callback) {
    FirebaseService.database()
      .ref(`/friends-requests/${userKey}/received/${friend.key}`)
      .once('value', snap => {

        if (!snap.exists()) return callback(null, 'snap-not-found')

        return FirebaseService.database()
          .ref(`/friends-requests/${userKey}/received/${friend.key}`)
          .set({
            ...snap.val(),
            status: 'approved'
          })
          .then(() => {
            return FirebaseService.database()
              .ref(`/friends/${userKey}/${friend.key}`)
              .set({
                userKey,
                friendKey: friend.key,
                Name: friend.Name,
                Avatar: friend.Avatar,
                usernameToLower: friend.usernameToLower,
                createdAt: (new Date()).valueOf()
              })
              .catch(err => callback(null, err))
              .then(() => callback({ ok: true }))
          })
          .catch(err => callback(null, err))
      }).catch(err => callback(null, err))
  }

  unfriend(userKey, friend, callback) {

    const httpsCallable = FirebaseService.functions().httpsCallable('unfriend')

    httpsCallable({
      userKey,
      friendKey: friend.key,
    }).then(({ data }) => callback(data))
  }

  enterDangerZone(alert, callback) {
    if(!alert) return

    const httpsCallable = FirebaseService.functions().httpsCallable('onEnterDangerZone')

    httpsCallable({}).then(({ data }) => callback(data))
    .catch((err) => callback(null, err))
  }

  enterPvZone(alert, callback) {
    if(!alert) return

    const httpsCallable = FirebaseService.functions().httpsCallable('onEnterPvZone')

    httpsCallable({}).then(({ data }) => callback(data))
    .catch((err) => callback(null, err))
  }

  inviteUserToPremium(userToInviteKey, callback) {
    if(!alert) return

    const httpsCallable = FirebaseService.functions().httpsCallable('sendInvitePremiumNotification')

    httpsCallable({userKey: userToInviteKey}).then(({ data }) => callback(data))
    .catch((err) => callback(null, err))
  }

  sendFriendRequests(fromKey, users, callback) {
    if (!users || !fromKey) return callback({ success: false })

    users.map(user => {

      FirebaseService.database()
        .ref(`/friends-requests/${fromKey}/sent`)
        .child(user.key)
        .remove()

      FirebaseService.database()
        .ref(`/friends-requests/${fromKey}/sent`)
        .child(user.key)
        .set({
          type: 'sent',
          from: fromKey,
          status: 'pending',
          usernameToLower: user.usernameToLower,
          createdAt: (new Date()).valueOf()
        })
    })

    return callback({ success: true })
  }

  deleteAccount() {
    var user = FirebaseService.auth().currentUser;
    user.delete();
  }
  updateEmail(newEmail) {

    var user = FirebaseService.auth().currentUser;
    user.updateEmail(newEmail).then(function () {
      // Update successful.
    }).catch(function (error) {
      // An error happened.
    });
  }
  forgodPassword(email) {
    FirebaseService.auth().sendPasswordResetEmail(email).then(function () {
    }).catch(function (err) {
    })
  }
}

export default new UserService()


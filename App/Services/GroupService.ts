import Group from '../Models/Group'
import FirebaseService from '../Services/Firebase'

interface ICallback {
  (result: object, error?: string): void;
}

export default {

  filterGroupInChatroom(groupKey, callback) {
    FirebaseService.database().ref('chatrooms').orderByChild('groupID').equalTo(groupKey).once("value", function (data) {
      return callback(data);
    })
  },

  getDetail(groupKey, callback) {
    FirebaseService.database().ref(`/groups/${groupKey}`).once('value', (snap) => {
      return callback(snap.val());
    })
  },
  deletedGroup(groupKey, chatroomKey) {
    FirebaseService.database().ref(`/chatrooms/${chatroomKey}`).remove();
    return FirebaseService.database().ref(`/groups/${groupKey}`).remove();
  },
  updateGroup(groupID, groupData) {
    FirebaseService.database().ref(`/groups/${groupID}`).update(groupData);
  },
  updateGroupStatus(groupID, statusJoinGroup) {
    FirebaseService.database().ref(`/groups/${groupID}`).update({ statusJoinGroup: statusJoinGroup });
  },
  // leavesFromGroup(groupData){
  // },

  updateGroupAndChatroom(group_key, chatroom_key, usersKey, callback) {
    FirebaseService.database().ref('/groups').child(group_key).update({ users: usersKey })
    FirebaseService.database().ref('/chatrooms').child(chatroom_key).update({ users: usersKey })
    return callback(true);
  },

  uniqueValue(data) {
    return data.filter((v, i, a) => a.indexOf(v) === i);
  },
  create(userKey: string, group: Group, callback: ICallback) {
    FirebaseService.database()
      .ref('/groups')
      .orderByChild('groupNameToLower')
      .equalTo(group.groupNameToLower)
      .once('value', (snap) => {

        if (snap.exists()) {
          let foundGroup = null;

          snap.forEach(grp => {
            foundGroup = { ...grp.val(), key: grp.key }

            return true
          })

          return callback(foundGroup, 'name-already-exists')
        }

        let data = {
          ...group,
          createdBy: userKey,
          key: null
        }

        data.users.push(userKey)
        data.users = this.uniqueValue(data.users);
        data.key = FirebaseService.database()
          .ref('/groups')
          .push(data).key

        return callback(data)
      })
  },

  subscribe(userKey, groupKey) {
    FirebaseService.database().ref(`/registrations/${groupKey}`)
      .child(userKey)
      .set({
        userKey,
        groupKey,
        status: 'pedding',
        sentAt: (new Date()).valueOf()
      })
  },
  getGroupDetail(userKey, groupKey, callback) {
    FirebaseService.database().ref(`/registrations/${groupKey}`)
      .child(userKey)
      .once('value', (snapshot) => {
        return callback(snapshot.val());
      });
  },
  deleteUserFromRegistrations(userKey, groupKey) {
    FirebaseService.database().ref(`/registrations/${groupKey}`)
      .child(userKey)
      .remove();
  },
  deleteUserDeleteGroup(createdByCurrentUser) {

    FirebaseService.database().ref('groups').orderByChild('createdBy').equalTo(createdByCurrentUser).once("value", function (data) {
      if (data.val()) {
        const groupKeys = Object.keys(data.val());
        if (groupKeys) {
          groupKeys.map((eachGroupKey) => {
            FirebaseService.database().ref('groups').child(eachGroupKey).remove();
            FirebaseService.database().ref('chatrooms').orderByChild('groupID').equalTo(eachGroupKey).once("value", function (chatroomData) {
              if (chatroomData.val()) {
                const groupIds = Object.keys(chatroomData.val())
                if (groupIds) {
                  FirebaseService.database().ref('chatrooms').child('groupID').remove()
                }
              }
            })

          })
        }
      }
      // return callback(data);
      // FirebaseService.database().ref(`/groups`).orderByChild('createdBy').equalTo(createdByCurrentUser).remove();
    })


  },

  inviteUsers(senderKey, users, groupKey) {
    users.map(key => {
      if (key == senderKey) return

      this.invite(senderKey, key, groupKey)
    })
  },

  invite(senderKey, userToInviteKey, groupKey) {

    FirebaseService.database().ref(`/group_invites/${groupKey}`)
      .child(userToInviteKey)
      .set({
        userToInviteKey,
        senderKey,
        groupKey,
        status: 'pedding',
        sentAt: (new Date()).valueOf()
      })
  },

  acceptInvite(userKey, groupKey, callback) {
    FirebaseService.database()
      .ref(`/group_invites/${groupKey}/${userKey}`)
      .update({ status: 'approved' })
      .then(() => callback ? callback({ ok: true }) : null)
      .catch(err => callback ? callback(null, err) : null)
  },

  acceptRequest(userKey, groupKey, callback) {
    FirebaseService.database()
      .ref(`/registrations/${groupKey}/${userKey}`)
      .update({ status: 'approved' })
      .then(() => callback({ ok: true }))
      .catch(err => callback(null, err))
  },

  rejectRequest(userKey, groupKey, callback) {
    FirebaseService.database()
      .ref(`/registrations/${groupKey}/${userKey}`)
      .remove()
      .then(() => callback({ ok: true }))
      .catch(err => callback(null, err))
  }
}

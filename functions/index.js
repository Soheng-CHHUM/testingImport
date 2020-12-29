const functions = require('firebase-functions');
const admin  = require('firebase-admin');
const geofire = require('geofire');
//const moment = require('moment')
const moment = require('moment-timezone');

// initializes your application
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const dateNow = () => moment().tz("Europe/Paris")
const nbKmCircleAlertPV = 0.2
const nbKmCircleZoneDanger = 0.8

const objectToArray = (obj) => {
    let arr = []

    if(!obj) return arr

    for(var key in obj) {
        arr.push(obj[key])
    }

    return arr
}

const addDeletable = (data) => {
    return admin.database().ref(`/deletables/${data.key}`)
        .set(data)
}

const makeNotification = (title, body, data, token, channelId, sound) => {
    return {
        android: {
            notification: {
                title: title,
                body: body,
                channelId,
                sound
            }
        },
        apns: {
            payload: {
                aps: {
                    sound
                }
            }
        },
        data,
        token,
        notification: {
            title,
            body
        }
    }
}

const Notification = () => {
    return {
        order: null,
        key: null,
        title: '',
        body: '',
        data: {},
        type: null,
        channelId: null,
        image: null,
        sound: 'default',
        isRecordable: true
    }
}

const sendNotificationToUser = (userKey, notification) => {

    notification.createdAt = dateNow().toDate().valueOf()

    return admin.database().ref(`/users/${userKey}`)
    .once('value', ownerSnap => {

        if(!ownerSnap.exists() || !notification.isRecordable) return

        let nbNotifications = ownerSnap.val().nbNotifications

        if(!nbNotifications) nbNotifications = 1
        else nbNotifications += 1
        
        notification.order = (dateNow().toDate().getTime() / 1000) * -1
        
        admin.database()
            .ref(`/notifications/${userKey}`)
            .push(notification)

        admin.database().ref(`/users/${userKey}`).update({nbNotifications})
    }).then(() => {
        return admin.database()
            .ref(`devices/${userKey}`)
            .once('value', snaps => {
                var messages = []

                if(!snaps.exists()) return

                snaps.forEach(childSnapshot => {
                    if(!childSnapshot.val().fcmToken) return
                    
                    messages.push(makeNotification(
                        notification.title, 
                        notification.body, 
                        notification.data, 
                        childSnapshot.val().fcmToken,
                        notification.channelId,
                        notification.sound
                    ))
                })

                if(messages.length == 0) return

                return admin.messaging().sendAll(messages).then((res) => {
                    if(res.responses) {
                        res.responses.map((res) => {
                            if(res.error) {
                                console.log('error', res.error.message + ' / ' + res.error.code)
                            }
                        })
                    }
                }).catch((err) => {
                    console.log(err);
                });
            })
    })
}

const updateOrCreateTag = (content, from, createdBy, callback) => {

    content = content.trim().toLowerCase()

    return admin.database().ref('/tags')
    .orderByChild('content')
    .equalTo(content)
    .once('value', snaps => {
        let key = null

        if(snaps.exists()) {

            snaps.forEach((child) => {
                key = child.key

                admin.database().ref('/tags')
                .child(child.key)
                .update({
                    usedNbTimes: child.val().usedNbTimes+1,
                })

                admin.database().ref(`/tags/references/${child.key}`)
                    .child(from.key)
                    .set(from)
            })
        }
        else {
            key = admin.database().ref('/tags')
            .push({
                content,
                createdBy,
                usedNbTimes: 1
            }).key

            admin.database().ref(`/tags/references/${key}`)
                .child(from.key)
                .set(from)
        }

        callback(key)
    })
}

const deleteTagReference = (tagKey, fromKey) => {
    return admin.database().ref('/tags')
        .child(tagKey)
        .once('value', tagSnap => {
            if(!tagSnap.exists()) return

            const usedNbTimes = tagSnap.val().usedNbTimes ? tagSnap.val().usedNbTimes-1 : 0

            admin.database().ref('/tags')
                .child(tagKey)
                .update({usedNbTimes})

            return admin.database().ref(`/tags/references/${tagKey}/${fromKey}`)
                .once('value', snap => {
                    if(!snap.exists()) return

                    return admin.database().ref(`/tags/references/${tagKey}/${fromKey}`).remove()
                })
        })
}

const isPrivateChatroom = (chatroom) => {
    return chatroom.exists() && chatroom.val().users && chatroom.val().users.length >= 2
}

const onUserHeardMessage = async function(userID, recordChannel, messageID) {
    
    const snap = await admin.database()
                        .ref('/messages/' + recordChannel)
                        .child(messageID)
                        .once('value')

    const userSnap = await admin.database()
                            .ref('/users')
                            .child(userID)
                            .once('value')
    
    const chatroomSnap = await admin.database()
                                .ref('/chatrooms')
                                .child(recordChannel)
                                .once('value')

    const deletable = await admin.database()
                                .ref('/deletables')
                                .child(messageID)
                                .once('value')

    return new Promise(resolve => {
        if(!snap.exists()) return resolve({ error: 'message-not-found'})
        if(!userSnap.exists()) return resolve({ error: 'user-not-exists'})

        let heardBy = snap.val().heardBy

        if(!heardBy) heardBy = {}

        if(heardBy[userID]) return resolve({ error: 'already-heard'})

        heardBy[userID] = {
            createdAt: dateNow().toDate().valueOf()
        }
        
        admin.database()
        .ref('/messages/' + recordChannel)
        .child(messageID)
        .update({
            heardBy
        })
        
        if(isPrivateChatroom(chatroomSnap) && userID != snap.val().userID) {
            admin.database()
            .ref('/settings/app')
            .once('value', snapSettings => {
                if(!snapSettings.exists() || !deletable.exists()) return

                let removeAt = deletable.val().removeAt

                if(snapSettings.val().privateMessageRemoveAfter) {
                    removeAt = moment().add(snapSettings.val().privateMessageRemoveAfter, 'hours').toDate().valueOf()
                }

                admin.database()
                .ref('/deletables')
                .child(messageID)
                .set({
                    removeAt
                })
            })
            
            decrementNbUnreadMessagesForUser(userSnap, recordChannel)
        }

        return resolve({success: true})
    })
}

const decrementNbUnreadMessagesForUser = (userSnap, recordChannel) => {
    let nbUnreadMessages = 0

    if(userSnap.val().nbUnreadMessages) nbUnreadMessages = userSnap.val().nbUnreadMessages - 1

    admin.database()
    .ref('/users')
    .child(userSnap.key)
    .update({ nbUnreadMessages })

    nbUnreadMessages = 0

    admin.database()
    .ref(`/chatrooms/users/${userSnap.key}`)
    .child(recordChannel)
    .once('value', userChatroomSnap => {
        if(!userChatroomSnap.exists()) return

        if(userChatroomSnap.val().nbUnreadMessages) nbUnreadMessages += userChatroomSnap.val().nbUnreadMessages -1

        admin.database()
        .ref(`/chatrooms/users/${userSnap.key}`)
        .child(recordChannel).update({
            nbUnreadMessages
        })
    })
}

exports.onCreateMessage = functions.database
.ref('messages/{threadID}/{messageID}')
.onCreate(event => {
    
    return admin.database().ref(event._path)
    .once('value', messageSnap => {

        var writeData = messageSnap.val();
        writeData.key = messageSnap.key;

        let removeAt = moment()
        admin.database().ref('/settings/app')
        .once('value', snapSettings => {
            if(!snapSettings.val()) return

            let durationInHours = 0

            if(event._data.recordChannel == 'Tous') durationInHours = snapSettings.val().messagesRemoveAfter
            else durationInHours = snapSettings.val().unheardPrivateMessageRemoveAfter

            if(!durationInHours) durationInHours = 1
            
            removeAt = moment().add(durationInHours, 'hours').toDate().valueOf()
            
            addDeletable({
                key: event.key,
                path: event._path,
                storage: {
                    filename: event._data.filename,
                    path: 'audios'
                },
                removeAt
            })
        })
        
        return admin.database().ref('users/' + writeData.userID)
        .once('value', userSnapshot => {

            var sender = userSnapshot.val();
            const senderKey = userSnapshot.key

            if(!sender) return;

            admin.database()
                .ref('chatrooms/' + writeData.recordChannel)
                .update({
                    lastMessage: writeData.key
                })
                
            let createdAt = dateNow()

            admin.database().ref(event._path)
            .update({
                createdAt: createdAt.toDate().valueOf(),
                createdAtText: createdAt.format("DD MMMM YYYY HH:mm:ss")
            })

            return admin.database().ref('chatrooms/' + writeData.recordChannel)
            .once('value')
            .then(chatroomSnap => {
                if(!chatroomSnap.val() || !chatroomSnap.val().users) return;

                var chatroom = chatroomSnap.val();
                chatroom.key = chatroomSnap.key;

                var messages = []

                const notification = {
                    title: sender.Name,
                    body: 'Nouveau message',
                }

                const isPrivateChannel = writeData.recordChannel != 'Tous'

                if(!isPrivateChannel) return

                chatroom.users.filter(userID => {
                    return userID != writeData.userID;
                })
                .map(userID => {
                    admin.database().ref('devices/' + userID)
                    .once('value')
                    .then(deviceSnap => {
                        let isThreadOpened = false;
                        let tokens = []

                        deviceSnap.forEach(childSnapshot => {

                            if(!childSnapshot.val().fcmToken) return
                            /*
                            if(childSnapshot.val().currentThread == writeData.recordChannel && childSnapshot.val().lastActionAt) {
                                let diff = new Date().valueOf() - new Date(childSnapshot.val().lastActionAt).valueOf();
                                let diffInHours = diff/1000/60/60;
                                
                                if(diffInHours <= 12 && childSnapshot.val().appState == 'active') isThreadOpened = true;
                            }
                            */
                            tokens.push(childSnapshot.val().fcmToken);
                        });
                        
                        //if(isThreadOpened) return
                        
                        return admin.database().ref('users/' + userID)
                        .once('value')
                        .then(receiverSnap => {
                            if(!receiverSnap.val()) return;

                            let nbUnreadMessages = 1;

                            if(receiverSnap.val().nbUnreadMessages) nbUnreadMessages += receiverSnap.val().nbUnreadMessages

                            /*admin.database().ref('users/' + userID)
                            .child('chatrooms/' + chatroom.key)
                            .update({
                                nbUnreadMessages
                            });*/

                            admin.database()
                                .ref('users/' + userID)
                                .update({
                                    nbUnreadMessages
                                });
                            
                            admin.database()
                                .ref(`/chatrooms/users/${userID}`)
                                .child(writeData.recordChannel)
                                .once('value', userChatroomSnap => {
                                    if(!userChatroomSnap.exists()) return
    
                                    let nbUnreadMessages = 1
    
                                    if(userChatroomSnap.val().nbUnreadMessages) nbUnreadMessages += userChatroomSnap.val().nbUnreadMessages
    
                                    admin.database()
                                    .ref(`/chatrooms/users/${userID}`)
                                    .child(writeData.recordChannel).update({
                                        nbUnreadMessages
                                    })
                            })
                            /*admin.database()
                            .ref(`/notifications/${userID}`)
                            .push({
                                title: notification.title,
                                body: notification.body,
                                from: senderKey,
                                to: chatroom.key,
                                type: 'new-message',
                                createdAt: new Date().valueOf()
                            })*/

                            return tokens.map((token) => {

                                messages.push({
                                    android: {
                                        notification: {
                                            title: notification.title,
                                            body: notification.body,
                                            channelId: '@bebeep-messages',
                                            icon: sender.Avatar,
                                            sound: 'default'
                                        }
                                    },
                                    apns: {
                                        payload: {
                                            aps: {
                                                badge: nbUnreadMessages,
                                                sound: 'default'
                                            }
                                        }
                                    },
                                    data: {
                                        fromKey: senderKey,
                                        fromName: sender.Name,
                                        chatroomKey: chatroom.key,
                                        messageKey: event.key,
                                        type: 'new-message'
                                    },
                                    token: token,
                                    notification
                                });
                            })
                            
                        }).then(() => {
                            
                            if(messages.length == 0) return null;

                            admin.messaging().sendAll(messages).then((res) => {
                                if(res.responses) {
                                    res.responses.map((res) => {
                                        if(res.error) {
                                            console.log('error', res.error.message + ' / ' + res.error.code)
                                        }
                                    })
                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                        })
                    });
                });
            });
        });
    });
});

exports.onUpdateUser = functions.database
.ref('users/{userID}')
.onUpdate(event => {

    return admin.database().ref(event.after._path)
    .once('value', (snapshot => {
        
        if(!snapshot.val()) return;
        
        if(event.after._data.isDeleted) {
            return admin.database().ref(event.after._path)
                        .update({
                            usernameToLower: null
                        });
        }

        if(event.before._data.Name != event.after._data.Name ||
            event.before._data.Avatar != event.after._data.Avatar || 
            event.before._data.status != event.after._data.status) {

            //reload chatrooms
            admin.database()
            .ref(`/chatrooms/users/${snapshot.key}`)
            .once('value', snaps => {
                snaps.forEach(snap => {
                    admin.database()
                    .ref(`/chatrooms/${snap.key}`)
                    .update({updatedAt: moment().toDate().valueOf()})
                })
            })
        }

        if(event.before._data.Name != event.after._data.Name || !event.after._data.usernameToLower) {
            if(!event.after._data.Name) return;

            return admin.database().ref(event.after._path)
                .update({
                    usernameToLower: event.after._data.Name.trim().toLowerCase()
                });
        }
    }));
});

exports.onCreateDangerZone = functions.database
.ref('geo/danger_zones/{alertID}')
.onCreate(event => {
    return new Promise(resolve => {
        let removeAt = moment().add(1, 'hours').toDate().valueOf();
    
        addDeletable({
            key: event.key,
            path: event._path,
            removeAt
        })

        return resolve()
    })
})

exports.onCreateAlert = functions.database
.ref('geo/alerts/{alertID}')
.onCreate(event => {
    return new Promise(resolve => {

        let removeAt = moment().add(0.2, 'hours').toDate().valueOf();
    
        addDeletable({
            key: event.key,
            path: event._path,
            removeAt
        })

        return resolve()
        
        /*
        let locations = new geofire.GeoFire(admin.database().ref('geo/locations'));

        let geoQuery = locations.query({
            center: [event._data.l[0], event._data.l[1]],
            radius: nbKmCircleAlertPV
        });

        return geoQuery.on('key_entered', (key) => {

            const notification = getNotificationOnEnterPvZone()

            sendNotificationToUser(key, notification)

            return resolve()
        });*/
    })
});

exports.onDeleteGroup = functions.database
.ref('/groups/{groupID}')
.onDelete(event => {
    
    return new Promise(resolve => {
        let tagsByKeys = event._data.tagsByKeys

        let users = event._data.users ? event._data.users : []

        //update tags
        for(var key in tagsByKeys) {
            deleteTagReference(key, event.key)
        }

        //remove users from group
        for(var index in users) {
            let userKey = users[index]

            admin.database().ref(`/groups/users/${userKey}`).child(event.key).remove()
        }
        
        //remove chatrooms that belongs to the group
        admin.database()
        .ref(`/chatrooms`)
        .orderByChild('groupID')
        .equalTo(event.key)
        .once('value', snaps => {
            snaps.forEach(snap => {
                admin.database()
                .ref(`/chatrooms`)
                .child(snap.key)
                .remove()
            })
        })

        return resolve()
    })
})

const reloadGroupUsers = (groupKey, users) => {

    let usersArr = Array.isArray(users) ? users : objectToArray(users)
    console.log('got users', usersArr)
    admin.database()
        .ref(`/groups/${groupKey}`)
        .once('value', grpSnap => {

            if(!grpSnap.exists()) return

            let grpUsers = grpSnap.val().users ? objectToArray(grpSnap.val().users) : []

            console.log('got users', usersArr)
            console.log('from users', users)
            console.log('with group users', grpUsers)

            grpUsers.map(key => {

                if(usersArr.find(otherKey => otherKey == key) != null) return
                
                admin.database()
                .ref(`/groups/users/${key}`)
                .child(groupKey)
                .remove()
            })

            for(var index in users) {
                let userKey = users[index]
        
                admin.database()
                .ref(`/groups/users/${userKey}`)
                .child(groupKey)
                .once('value', (snap) => {
        
                    if(snap.exists()) return
                    
                    admin.database().ref(`/users/${userKey}`)
                    .once('value', userSnap => {
                        if(!userSnap.exists()) return
                        
                        admin.database()
                        .ref(`/groups/users/${userKey}`)
                        .child(groupKey)
                        .set({
                            addedAt: dateNow().toDate().valueOf()
                        })
        
                        admin.database().ref(`/users/${userKey}`)
                        .update({
                            nbGroups: userSnap.val().nbGroups ? userSnap.val().nbGroups+1 : 1
                        })
                    })
                })
            }
        })
    
}

exports.onCreateGroup = functions.database
.ref('/groups/{groupID}')
.onCreate(event => {

    const groupKey = event.key
    let tags = event._data.tags ? event._data.tags : []
    let tagsByKeys = {}
    let users = event._data.users ? event._data.users : []
    let tagUpdates = []

    if(groupKey == 'users') return

    for(var index in tags) {
        let tag = tags[index]
        tagUpdates.push(updateOrCreateTag(tag, {key: groupKey, path: event._path, ...event._data}, event._data.createdBy, (key) => tagsByKeys[key] = tag))
    }

    reloadGroupUsers(groupKey, users)

    return Promise.all(tagUpdates).then(() => {
        return admin.database().ref('/groups').child(groupKey).update({
            groupNameToLower: event._data.name ? event._data.name.trim().toLowerCase() : '',
            tagsByKeys
        })
    })
})

exports.onUpdateGroup = functions.database
.ref('/groups/{groupID}')
.onUpdate(event => {
    
    let oldUsers = event.before._data.users ? objectToArray(event.before._data.users) : []
    let newUsers = event.after._data.users ? objectToArray(event.after._data.users) : []

    if(oldUsers.length != newUsers.length) reloadGroupUsers(event.after.key, newUsers)

    oldUsers.map(key => {

        if(newUsers.find(otherKey => otherKey == key) != null) return
        
        admin.database()
        .ref(`/groups/users/${key}`)
        .child(event.after.key)
        .remove()
    })
    
    const getTagKeyByName = (name, tagsByKeys) => {
        for(var key in tagsByKeys) {
            if(tagsByKeys[key] == name) return key
        }

        return null
    }

    const oldTagsByKeys = event.before._data.tagsByKeys ? event.before._data.tagsByKeys : {}
    const newTagsByKeys = event.after._data.tagsByKeys ? event.after._data.tagsByKeys : {}
    const oldTags = event.before._data.tags ? objectToArray(event.before._data.tags) : []
    const newTags = event.after._data.tags ? objectToArray(event.after._data.tags) : []

    let tagUpdates = []
    let tagsByKeys = event.after._data.tagsByKeys ? event.after._data.tagsByKeys : {}

    const oldTagsToRemove = oldTags.filter(oldTagName => newTags.find(newTagName => newTagName == oldTagName) == null)

    oldTagsToRemove.map(tagName => {
        let key = getTagKeyByName(tagName, oldTagsByKeys)

        if(key) deleteTagReference(key, event.after.key)

        if(tagsByKeys[key]) delete tagsByKeys[key]
    })

    newTags.map(tagName => {

        let key = getTagKeyByName(tagName, newTagsByKeys)

        const from = {key: event.after.key, path: event.after._path, ...event.after._data}

        if(tagsByKeys[key]) {
            admin.database().ref(`/tags/references/${key}`)
                .child(from.key)
                .set(from)
        } else {
            tagUpdates.push(updateOrCreateTag(tagName, from, from.createdBy, (key) => tagsByKeys[key] = tagName))
        }
    })
    
    const tagsHaveChanged = oldTags.length != newTags.length
    const nameHasChanged = event.before._data.name != event.after._data.name

    const updateChatrooms = () => {
        admin.database()
        .ref(`/chatrooms`)
        .orderByChild('groupID')
        .equalTo(event.after.key)
        .once('value', snaps => {
            
            snaps.forEach(snap => {

                if(oldUsers.length != newUsers.length) syncChatroomDataForUsers(newUsers, {key: snap.key, ...snap.val()}).then(() => {})
                
                if(event.after._data.name == event.before._data.name && event.after._data.image == event.before._data.image) return

                admin.database()
                .ref(`/chatrooms`)
                .child(snap.key)
                .update({
                    name: event.after._data.name ? event.after._data.name : null,
                    image: event.after._data.image ? event.after._data.image : null,
                    updatedAt: new Date().getTime()
                })
            })
        })
    }

    return Promise.all(tagUpdates).then(() => {

        if(tagsHaveChanged || nameHasChanged) {

            return admin.database().ref('/groups').child(event.after.key).update({
                groupNameToLower: event.after._data.name ? event.after._data.name.trim().toLowerCase() : '',
                tagsByKeys
            })
            .then(() => updateChatrooms())
            .catch(() => updateChatrooms())
        }

        return updateChatrooms()
    })
})

exports.onCreateUserGroup = functions.database
.ref('/groups/users/{userKey}/{groupKey}')
.onCreate(event => {

    const userKey = event.ref.parent.key

    return admin.database()
    .ref(`/chatrooms`)
    .orderByChild('groupID')
    .equalTo(event.key)
    .once('value', snaps => {
        snaps.forEach(snap => {
            let users = snap.val().users ? objectToArray(snap.val().users) : []

            const hasUser = users.find(key => key == userKey) != null

            if(hasUser) return

            users.push(userKey)

            admin.database().ref(`/chatrooms/${snap.key}`)
                .update({
                    users,
                    usersKey: users.sort().join(',')
                })
        })
    })
})

exports.onDeleteUserGroup = functions.database
.ref('/groups/users/{userKey}/{groupKey}')
.onDelete(event => {
    const userKey = event.ref.parent.key

    return admin.database().ref(`/users/${userKey}`)
    .once('value', userSnap => {
        if(!userSnap.exists()) return

        admin.database().ref(`/users/${userKey}`)
        .update({
            nbGroups: userSnap.val().nbGroups ? userSnap.val().nbGroups-1 : 0
        })

        return admin.database()
            .ref(`/chatrooms`)
            .orderByChild('groupID')
            .equalTo(event.key)
            .once('value', snaps => {
                snaps.forEach(snap => {
                    let users = snap.val().users ? objectToArray(snap.val().users) : []

                    users = users.filter(key => key != userKey)

                    admin.database().ref(`/chatrooms/${snap.key}`)
                        .update({
                            users,
                            usersKey: users.sort().join(',')
                        })
                })
            })
    })
})

exports.onCreateGroupRegistration = functions.database
.ref('/registrations/{groupID}/{userID}')
.onCreate(event => {
    var groupID = event.ref.parent.key
    var userID = event.key

    return admin.database().ref(`/groups/${groupID}`)
    .once('value', snap => {
        if(!snap.exists()) return

        return admin.database().ref(`/users/${userID}`)
        .once('value', senderSnap => {
            const ownerID = snap.val().createdBy
            const groupName = snap.val().name
            const senderName = senderSnap.val().Name

            let notification = Notification()
            
            notification.title = senderName
            notification.body = `veut rejoindre votre groupe ${groupName}`
            notification.data = {
                requestKey: groupID,
                senderKey: senderSnap.key,
                senderName,
                groupName,
                type: 'group-access'
            }
            notification.key = groupID
            notification.type = 'group-access'
            notification.channelId = '@bebeep-alerts' 
            notification.sound = 'alert'
            notification.image = {
                user: senderSnap.val().Avatar ? senderSnap.val().Avatar : null,
                group: snap.val().image ? snap.val().image : null
            }

            return sendNotificationToUser(ownerID, notification)
        })
    })
})

const addUserToGroup = (userKey, groupKey) => {

    return admin.database().ref(`/groups/${groupKey}`)
        .once('value', groupSnap => {
            if(!groupSnap.exists()) return

            const ownerKey = groupSnap.val().createdBy
            const groupName = groupSnap.val().name

            let users = groupSnap.val().users ? objectToArray(groupSnap.val().users) : []

            if(users.find(key => key == userKey) == null) users.push(userKey)
            
            reloadGroupUsers(groupKey, users)
            
            admin.database().ref(`/groups/${groupKey}`)
                .update({
                    users
                })

            return admin.database().ref(`/notifications/${ownerKey}`)
            .orderByChild('key')
            .equalTo(groupKey)
            .once('value', snaps => {
                snaps.forEach(snap => {

                    if(!snap.val() || !snap.val().data || snap.val().data.senderKey != userKey) return

                    admin.database().ref(`/notifications/${ownerKey}/${snap.key}`).update({
                        body: `Est maintenant membre du groupe ${groupName}`,
                        answered: true
                    })
                })
            })
        })
}

exports.onUpdateGroupRegistration = functions.database
.ref('/registrations/{groupID}/{userID}')
.onUpdate(event => {
    const groupKey = event.after.ref.parent.key
    
    return new Promise(resolve => {
        if(event.after._data.status == 'approved') addUserToGroup(event.after.key, groupKey)

        return resolve()
    })
})

exports.onDeleteGroupRegistration = functions.database
.ref('/registrations/{groupID}/{userID}')
.onDelete(event => {
    const groupKey = event.ref.parent.key

    return admin.database().ref(`/groups/${groupKey}`)
        .once('value', groupSnap => {
            if(!groupSnap.exists()) return
            const ownerKey = groupSnap.val().createdBy

            admin.database().ref(`/notifications/${ownerKey}`)
                .orderByChild('key')
                .equalTo(groupKey)
                .once('value', snaps => {
                    
                    snaps.forEach(snap => {

                        if(!snap.val() || !snap.val().data || snap.val().data.senderKey != event.key) return

                        admin.database().ref(`/notifications/${ownerKey}/${snap.key}`).remove()
                    })
                })
        })
})

exports.onCreateGroupInvite = functions.database
.ref('/group_invites/{groupID}/{userID}')
.onCreate(event => {
    const groupID = event.ref.parent.key
    const userID = event.key

    return admin.database().ref(`/groups/${groupID}`)
    .once('value', snap => {
        if(!snap.exists()) return

        const ownerID = snap.val().createdBy
        const groupName = snap.val().name
        
        return admin.database().ref(`/users/${ownerID}`)
        .once('value', senderSnap => {
            
            let notification = Notification()
            
            const senderName = senderSnap.val().Name
            notification.title = senderName
            notification.body = `vous invite à rejoindre son groupe ${groupName}`
            notification.data = {
                requestKey: groupID,
                senderKey: senderSnap.key,
                senderName,
                groupName,
                type: 'group-access'
            }
            notification.key = groupID
            notification.type = 'group-access'
            notification.channelId = '@bebeep-alerts'
            notification.sound = 'alert'
            notification.image = {
                user: senderSnap.val().Avatar ? senderSnap.val().Avatar : null,
                group: snap.val().image ? snap.val().image : null
            }

            return sendNotificationToUser(userID, notification)
        })
    })
})

exports.onUpdateGroupInvite = functions.database
.ref('/group_invites/{groupID}/{userID}')
.onUpdate(event => {
    const groupKey = event.after.ref.parent.key
    
    return new Promise(resolve => {
        if(event.after._data.status == 'approved') addUserToGroup(event.after.key, groupKey)

        return resolve()
    })
})

exports.onCreateUser = functions.database
.ref('/users/{userKey}')
.onCreate(event => {
    return admin.database()
    .ref('/invites')
    .orderByChild('phoneNumber')
    .equalTo(event._data.Phone)
    .once('value', snaps => {
        if(!snaps.exists()) return

        snaps.forEach(snap => {

            const senderKey = snap.val().fromKey

            const notification = {
                title: event._data.Name,
                body: 'A rejoint BeBeep !'
            };

            /*admin.database()
            .ref(`/notifications/${senderKey}`)
            .push({
                title: notification.title,
                body: notification.body,
                type: 'new-subscribe'
            })*/
            
            return admin.database().ref('devices/' + senderKey)
            .once('value')
            .then(snapshot => {
                
                var messages = [];

                snapshot.forEach((childSnapshot) => {

                    if(!childSnapshot.val().fcmToken) return
                    
                    messages.push({
                        android: {
                            notification: {
                                title: notification.title,
                                body: notification.body,
                                channelId: '@bebeep-alerts',
                                sound: 'alert'
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'alert'
                                }
                            }
                        },
                        data: {
                            fromUserKey: event.key,
                            type: 'new-subscribe'
                        },
                        token: childSnapshot.val().fcmToken,
                        notification
                    });
                });
                
                if(messages.length == 0) return

                return admin.messaging().sendAll(messages).then((res) => {
                    if(res.responses) {
                        res.responses.map((res) => {
                            if(res.error) {
                                console.log('error', res.error.message + ' / ' + res.error.code)
                            }
                        })
                    }
                }).catch((err) => {
                    console.log(err);
                });
            });
        })
    })
})

exports.onCreateReport = functions.database
.ref('/reports/{curUserKey}/{otherUserKey}')
.onCreate(event => {
    let createdAt = dateNow()

    return admin.database()
            .ref(event._path)
            .update({
                createdAt: createdAt.toDate().valueOf(),
                createdAtText: createdAt.format("DD MMMM YYYY HH:mm:ss")
            })
})

exports.onCreateFriendsRequest = functions.database
.ref('/friends-requests/{userKey}/sent/{receiverKey}')
.onCreate(event => {
    const receiverKey = event.key
    const senderKey = event._data.from

    return admin.database()
        .ref(`/users/${senderKey}`)
        .once('value', snap => {

            admin.database()
                .ref(`/friends-requests/${receiverKey}/received/${senderKey}`)
                .set({
                    type: 'received',
                    from: senderKey,
                    status: 'pending',
                    usernameToLower: snap.val().usernameToLower,
                    createdAt: dateNow().toDate().valueOf()
                })

            let notification = Notification()
            
            notification.title = snap.val().Name
            notification.body = 'Vous a envoyé une invitation.'
            notification.data = {
                requestKey: event.key,
                senderKey,
                senderName: snap.val().Name,
                type: 'friend-request'
            }
            notification.type = 'friend-request'
            notification.channelId = '@bebeep-alerts'
            notification.sound = 'alert'
            notification.image = snap.val().Avatar ? snap.val().Avatar : null

            return sendNotificationToUser(receiverKey, notification)
        })
})

exports.onDeleteFriendsRequest = functions.database
.ref('/friends-requests/{userKey}/received/{senderKey}')
.onDelete(event => {
    const userKey = event.ref.parent.parent.key
    return admin.database()
        .ref(`/friends-requests/${event._data.from}/sent/${userKey}`)
        .remove()
})

exports.onCreateFriend = functions.database
.ref('/friends/{userKey}/{friend}')
.onCreate(event => {
    return admin.database().ref(`/friends/${event.key}/${event._data.userKey}`)
        .once('value', snap => {
            if(snap.exists()) return

            return admin.database().ref(`/users/${event._data.userKey}`)
            .once('value', snapUser => {
                if(!snapUser.exists()) return

                return admin.database().ref(`/friends/${event.key}/${event._data.userKey}`)
                .set({
                    userKey: event.key,
                    friendKey: event._data.userKey,
                    Name: snapUser.val().Name,
                    Avatar: snapUser.val().Avatar,
                    usernameToLower: snapUser.val().usernameToLower,
                    createdAt: dateNow().toDate().valueOf()
                })
            })
        })
})

exports.onCreateBlockUser = functions.database
.ref('/blocks/{fromKey}/{toKey}')
.onCreate(event => {
    return admin.database()
        .ref(`/blocks/${event._data.to}/${event._data.from}`)
        .once('value', snap => {
            if(snap.exists()) return

            const usersKey = [event._data.to, event._data.from].sort().join(',')
            
            return admin.database().ref('/chatrooms')
            .orderByChild('usersKey')
            .equalTo(usersKey)
            .once('value', snaps => {
                snaps.forEach(chatroomSnap => {
                    admin.database().ref(`/chatrooms/${chatroomSnap.key}`).remove()
                })

                return admin.database()
                .ref(`/blocks/${event._data.to}/${event._data.from}`)
                .set({
                    from: event._data.to,
                    to: event._data.from,
                    createdBy: 'admin',
                    updatedAt: new Date().getTime()
                })
            })
        })
})

const NB_HOURS_REMOVE_PARKING_LOCATION = 24;

exports.onCreateGeoLocation = functions.database
.ref('/geo/locations/{userKey}')
.onCreate(event => {

    let removeAt = moment().add(NB_HOURS_REMOVE_PARKING_LOCATION, 'hours').toDate().valueOf(); //auto remove after 24h if not removed by the user

    addDeletable({
        key: event.key,
        path: event._path,
        removeAt
    })
})

exports.onUpdateGeoLocation = functions.database
.ref('/geo/locations/{userKey}')
.onUpdate(event => {

    let removeAt = moment().add(NB_HOURS_REMOVE_PARKING_LOCATION, 'hours').toDate().valueOf(); //auto remove after 24h if not removed by the user

    addDeletable({
        key: event.key,
        path: event._path,
        removeAt
    })
})

const syncChatroomDataForUsers = async(users, chatroom) => {

    let requests = []

    let userKeys = {}

    users.map(key => {

        userKeys[key] = true

        requests.push(getChatroomDataForUser(key, chatroom, data => {
            admin.database()
            .ref(`/chatrooms/users/${key}`)
            .child(chatroom.key)
            .set({
                ...chatroom,
                ...data,
                createdAt: dateNow().toDate().valueOf(),
                updatedAt: dateNow().toDate().valueOf()
            })
        }))
    })

    const chatroomSnap = await admin.database()
                                     .ref(`/chatrooms/${chatroom.key}`)
                                     .once('value')

    const chatroomUsers = chatroomSnap.val() && chatroomSnap.val().users ? chatroomSnap.val().users : []

    chatroomUsers.map(key => {
        if(userKeys[key]) return

        admin.database()
            .ref(`/chatrooms/users/${key}`)
            .child(chatroom.key)
            .remove()
    })

    return Promise.all(requests)
}

const getChatroomDataForUser = async(userKey, chatroom, callback) => {

    const chatroomSnap = await admin.database()
        .ref(`/chatrooms/users/${userKey}`)
        .child(chatroom.key)
        .once('value')

    let data = { 
        name: chatroom.name ? chatroom.name : null, 
        image: chatroom.image ? chatroom.image : null,
        status: chatroom.status ? chatroom.status : null,
        lastMessage: chatroom.lastMessage ? chatroom.lastMessage : null,
        nbUnreadMessages: chatroomSnap.val() && chatroomSnap.val().nbUnreadMessages ? chatroomSnap.val().nbUnreadMessages : null,
    }

    if(chatroom.users.length > 2 || chatroom.groupID) return callback(data)
    
    let chatroomUsers = chatroom.users ? objectToArray(chatroom.users) : []

    const otherUserKey = chatroomUsers.find(key => key != userKey)
    
    if(otherUserKey == null) return callback(data)
    
    const snap = await admin.database().ref('/users')
                        .child(otherUserKey)
                        .once('value')

    if(!snap.exists()) return callback(data)

    data.name = snap.val().Name ? snap.val().Name : null
    data.image = snap.val().Avatar ? snap.val().Avatar : null
    data.status = snap.val().status ? snap.val().status : null

    return callback(data)
}

exports.onCreateChatroom = functions.database
.ref('/chatrooms/{key}')
.onCreate(event => {

    if(!event._data.users) return

    return new Promise(resolve => {
        
        let users = []
        
        for(var index in event._data.users) {
            users.push(event._data.users[index])
        }

        if(users.find(key => key == event._data.createdBy) == null) users.push(event._data.createdBy)

        let chatroom = {...event._data, key: event.key, users}

        return syncChatroomDataForUsers(users, chatroom).then(() => resolve(users))
    })
    
})

exports.onUpdateChatroom = functions.database
.ref('/chatrooms/{key}')
.onUpdate(event => {
    
    if(event.after.key == 'users') return

    return admin.database()
    .ref(`/chatrooms/${event.after.key}`)
    .once('value', snap => {
        
        if(!snap.val().users) return
        
        let users = snap.val().users ? objectToArray(snap.val().users) : []
        
        if(!users.find(key => key == snap.val().createdBy)) users.push(snap.val().createdBy)

        return syncChatroomDataForUsers(users, {...snap.val(), key: snap.key}).then(() => {})
    })  
})

exports.onDeleteNotification = functions.database
.ref('/notifications/{userKey}/{notificationKey}')
.onDelete(event => {
    const userKey = event.ref.parent.key

    return admin.database()
        .ref(`/users/${userKey}`)
        .once('value', snap => {
            if(!snap.exists()) return

            let nbNotifications = snap.val().nbNotifications

            if(!nbNotifications) nbNotifications = 0
            else nbNotifications--

            return admin.database()
                .ref(`/users/${userKey}`)
                .update({nbNotifications})
        })
})

exports.onDeleteMessage = functions.database
.ref('/messages/{chatroomKey}/{messageKey}')
.onDelete(event => {
    return admin.database()
        .ref(`/chatrooms/${event._data.recordChannel}`)
        .once('value', snap => {

            admin.database()
            .ref(`/geo/messages/${event._data.recordChannel}`)
            .child(event.key)
            .remove()

            if(!snap.exists()) return

            if(!isPrivateChatroom(snap)) return

            let messageHeardBy = event._data.heardBy ? event._data.heardBy : {}

            return snap.val().users.map(userKey => {
                let isUserHeardMessage = messageHeardBy[userKey] != null

                if(isUserHeardMessage || userKey == event._data.userID) return

                return admin.database()
                            .ref(`/users/${userKey}`)
                            .once('value', userSnap => {
                                decrementNbUnreadMessagesForUser(userSnap, event._data.recordChannel)
                            })
            })
        })
})

exports.onDeleteChatroom = functions.database
.ref('/chatrooms/{key}')
.onDelete(event => {
    
    return new Promise(resolve => {

        let users = []
        
        for(var index in event._data.users) {
            users.push(event._data.users[index])
        }

        if(!users.find(key => key == event._data.createdBy)) users.push(event._data.createdBy)

        users.map(key => {
            admin.database()
                .ref(`/chatrooms/users/${key}`)
                .child(event.key)
                .remove()
        })

        return resolve(users)
    })
})

//HTTP REQUESTS
exports.listenMessage = functions.https.onCall((data) => {
    if(!data.userKey || !data.messageKey || !data.recordChannel) return {
        error: 'param missing (userKey and/or messageKey and/or recordChannel)'
    }

    return onUserHeardMessage(data.userKey, data.recordChannel, data.messageKey).then((res) => res)
})

const reloadNbGroupsForUser = async(userKey, context) => {

    const userSnap = await admin.database().ref(`/users/${userKey}`).once('value')
    
    if(!userSnap.exists()) return {
        error: 'user not exists'
    }

    if(userSnap.val().uid != context.auth.uid) return {
        error: 'you don\'t have sufficient rights'
    }

    const userGroups = await admin.database().ref(`/groups/users/${userKey}`).once('value')

    let nbGroups = 0

    userGroups.forEach(() => nbGroups++)

    admin.database().ref(`/users/${userKey}`)
        .update({
            nbGroups
        })

    return {
        ok: true
    }
}

exports.reloadNbGroups = functions.https.onCall((data, context) => {
    if(!data.userKey) {
        return {
            error: 'param missing (userKey)'
        }
    }
    
    return reloadNbGroupsForUser(data.userKey, context)
})

exports.unfriend = functions.https.onCall((data) => {
    if(!data.userKey || !data.friendKey) return {
        error: 'param missing (friendKey and/or userKey)'
    }

    admin.database()
    .ref(`/friends-requests/${data.userKey}/sent/${data.friendKey}`)
    .remove()

    admin.database()
    .ref(`/friends-requests/${data.friendKey}/sent/${data.userKey}`)
    .remove()

    admin.database()
    .ref(`/friends/${data.friendKey}/${data.userKey}`)
    .remove()
    
    admin.database()
    .ref(`/friends/${data.userKey}/${data.friendKey}`)
    .remove()

    return {ok: true}
})

const getNotificationOnEnterDangerZone = () => {
    const type = 'danger-zone'

    let notification = Notification()
    notification.title = 'Attention !'
    notification.body = `Vous rentrez dans une zone de danger`
    notification.type = type
    notification.data = {
        type
    }
    notification.isRecordable = false
    notification.channelId = '@bebeep-alerts-zone' 
    notification.sound = 'alert_zone'

    return notification
}

exports.onEnterDangerZone = functions.https.onCall((data, ctx) => {
    return onUserEnterAlertZone(ctx.auth, getNotificationOnEnterDangerZone()).then(res => res)
})

const getNotificationOnEnterPvZone = () => {
    const type = 'pv-zone'
    let notification = Notification()

    notification.isRecordable = false
    notification.title = 'Attention !'
    notification.body = `Contrôle de stationnement dans votre zone`
    notification.type = type
    notification.data = {
        type
    }
    notification.channelId = '@bebeep-alerts-pv' 
    notification.sound = 'alert_pv'

    return notification
}

exports.onEnterPvZone = functions.https.onCall((data, ctx) => {
    return onUserEnterAlertZone(ctx.auth, getNotificationOnEnterPvZone()).then(res => res)
})

const onUserEnterAlertZone = async(auth, notification) => {
    if(!auth) return {ok: false, err: 'unauthenticated'}

    const users = await admin.database()
                             .ref('/users')
                             .orderByChild('uid')
                             .equalTo(auth.uid)
                             .once('value')
    let user = null

    users.forEach(snap => user = {...snap.val(), key: snap.key })
    
    if(user == null || user.key == null) return {ok: false, err: 'user-not-found'}

    return new Promise(resolve => {
        sendNotificationToUser(user.key, notification)

        return resolve({ ok: true })
    })
}

exports.sendInvitePremiumNotification = functions.https.onCall((data, ctx) => {
    return onUserSendInvitePremiumNotification(ctx.auth, data).then(res => res)
})

const onUserSendInvitePremiumNotification = async(auth, data) => {
    if(!auth) return {ok: false, err: 'unauthenticated'}
    if(!data.userKey) return {ok: false, err: 'userKey is missing'}

    const users = await admin.database()
                             .ref('/users')
                             .orderByChild('uid')
                             .equalTo(auth.uid)
                             .once('value')
    let user = null

    users.forEach(snap => user = {...snap.val(), key: snap.key })
    
    if(user == null || user.key == null) return {ok: false, err: 'user-not-found'}

    return new Promise(resolve => {
       
        const type = 'invite-premium'
        let notification = Notification()
    
        notification.isRecordable = false
        notification.title = 'Invitation'
        notification.body = `${user.Name} vous invite à passer Premium.`
        notification.type = type
        notification.data = {
            type
        }
        notification.channelId = '@bebeep-messages' 
        notification.sound = 'alert'
    
        sendNotificationToUser(data.userKey, notification)

        return resolve({ ok: true })
    })
}

exports.removeUnwantedNotifications = functions.https.onCall(() => {
    let nbRemovedNotifs = 0

    return admin.database().ref('/notifications')
        .once('value', (snaps) => {
            snaps.forEach(snap => {
                snap.forEach(notifSnap => {
                    if(!notifSnap.val()) return

                    if(notifSnap.val().type == 'pv-zone' || notifSnap.val().type == 'danger-zone' || !notifSnap.val().type) {
                        nbRemovedNotifs++
                        admin.database().ref(`/notifications/${snap.key}`)
                            .child(notifSnap.key)
                            .remove()
                    }
                })
            })

            console.log('remove nb notifications', nbRemovedNotifs)
        })
})

//SCHEDULED JOBS
exports.removeOldDataCron = functions.pubsub.schedule('every 10 minutes').onRun((ctx) => {

    return admin.database()
        .ref('/deletables')
        .orderByChild('removeAt')
        .endAt(moment().toDate().valueOf())
        .once('value', snaps => {
            snaps.forEach(snap => {

                if(!snap.val().path) return admin.database()
                                                 .ref('/deletables')
                                                 .child(snap.key)
                                                 .remove()
                
                let frags = snap.val().path.split('/')

                if(frags.length < 2) return admin.database()
                                                 .ref('/deletables')
                                                 .child(snap.key)
                                                 .remove()
                
                admin.database().ref(snap.val().path).remove()
                
                if(snap.val().storage && snap.val().storage.filename) {
                    admin.storage().bucket()
                        .file(`${snap.val().storage.path}/${snap.val().storage.filename}`)
                        .delete()
                }
                
                admin.database()
                    .ref('/deletables')
                    .child(snap.key)
                    .remove()
            })
        })
})
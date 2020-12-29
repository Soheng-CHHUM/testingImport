
import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native'
import _ from 'lodash'
import UserService from '../../Services/User'

import UserPictureComponent from '../UserPicture'
import Translator from '../../Translations/Translator'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Searcher from '../../Services/Searcher'
import styles from '../Styles/SearchListStyle'

class UserRow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            item: props.item,
            index: props.index,
            otherItemData: props.otherItemData ? props.otherItemData : { requests: {}, friends: {} },
            isSelected: props.isSelected,
            onPress: props.onPress
        }
    }

    componentWillReceiveProps(props) {
        this.setState({
            item: props.item ? props.item : this.state.item,
            otherItemData: props.otherItemData ? props.otherItemData : { requests: {}, friends: {} },
            index: props.index,
            isSelected: props.isSelected,
            onPress: props.onPress
        })
    }

    inviteButton = () => {
        const { item, otherItemData, isSelected, onPress } = this.state
        let statusInvited = false;
        if(global.chatroom){
          const checkExistingUserInvited = keyParams => global.chatroom.users.some( (invitedKey) => invitedKey == keyParams)
          if(checkExistingUserInvited(item.key)){
            statusInvited = true;
          }
        }

        if (item.relationship=="friend" || otherItemData && !_.isEmpty(otherItemData) && otherItemData.friends[item.key] || statusInvited) {
            return <View style={styles.thirdColumn}>
            {/* return <TouchableOpacity style={styles.thirdColumn} onPress={() => onPress && onPress(item)}> */}
                <Text style={{ color: 'white' }}>{Translator.t('common.friends')}</Text>
            </View>
        }

        if (item.relationship=="invited" || isSelected) {
          // if (isSelected || (otherItemData && otherItemData.requests[item.key])) {
            return <View style={[styles.thirdColumn, { backgroundColor: '#EBEBF2', flexDirection: 'row' }]}>
            {/* return <TouchableOpacity style={[styles.thirdColumn, { backgroundColor: '#EBEBF2', flexDirection: 'row' }]} onPress={() => onPress && onPress(item)}> */}
                <Ionicons name="ios-send" size={20} />
                <Text style={{ color: 'black' }}>  {Translator.t('common.invited')}</Text>
            </View>
        }

        return <TouchableOpacity style={styles.thirdColumn} onPress={() => onPress && onPress(item)}>
            <Text style={{ color: 'white' }}> + {Translator.t('common.invite')}</Text>
            {/* {
                UserService.sendFriendRequests(fromKey, users, callback)
            } */}
        </TouchableOpacity>
    }

    render() {

        const { item, index, onPress } = this.state

        return <View key={`TouchableOpacity_${index}`} style={styles.listItemContainer}>
            <View key={`View_Top_${index}`} style={styles.listItem}>
                <TouchableOpacity style={styles.firstColumn}>
                    <UserPictureComponent
                        onPress={() => onPress && onPress(item, 'index_of_request_fri_to_join')}
                        key={`UserPictureComponent_${index}`}
                        user={item} />
                </TouchableOpacity>
                <View style={styles.secondColumn}>
                    <Text key={`Text${index}_${item.Name}`} style={styles.listItemText}>{item.Name}</Text>
                </View>
                {
                    this.inviteButton()
                }
            </View>
        </View>
    }
}

const key = 'usernameToLower'

export default {
    component: UserRow,
    title: 'Utilisateurs',
    path: 'users',
    key,
    deeperSearch: (curUser, text, callback) => {
        var friendsData = { requests: {}, friends: {} }

        if (text == null || text == '') return callback(friendsData)

        Searcher.searchQuery(`/friends-requests/${curUser.Key}/sent`, key, text, snaps => {

            snaps.forEach((childSnapshot) => {
                friendsData.requests[childSnapshot.key] = { ...childSnapshot.val(), key: childSnapshot.key }
            })

            return Searcher.searchQuery(`/friends/${curUser.Key}`, key, text, friends => {
                friends.forEach((childSnapshot) => {
                    friendsData.friends[childSnapshot.key] = { ...childSnapshot.val(), key: childSnapshot.key }
                })

                return callback(friendsData)
            })
        })
    },
    filter: (curUserKey, snapshot, callback) => {
        var users = {};
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key && childSnapshot.key != curUserKey){
                users[childSnapshot.key] = { ...childSnapshot, key: childSnapshot.key}
            }
        });
        UserService.filterInvisibleUsers(curUserKey, users, (usersFiltered) => {
            /*let visibleUsers = [];

            snapshot.forEach((childSnapshot) => {
                if (!usersFiltered.includes(childSnapshot.key)) return;

                visibleUsers.push({ ...childSnapshot.val(), Key: childSnapshot.key, key: childSnapshot.key});
            });*/

            return callback(usersFiltered)
        });
    }
}

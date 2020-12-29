
import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native'
import { select, take } from 'redux-saga/effects'
import UserRow from './UserRow'
import ContactService from '../../Services/ContactService'
import UserService from '../../Services/User'
import FirebaseService from '../../Services/Firebase'
import { selectUser } from '../../Redux/AuthRedux'
import PhoneToIndex from '../../Transforms/PhoneToIndex'
import Translator from '../../Translations/Translator'
import styles from '../Styles/SearchListStyle'
import { Colors } from '../../Themes';

class ContactLoader {

  contacts = []

  async getContacts() {

    const contactsList = await ContactService.getAll()

    let phoneContacts = []

    for(var index in contactsList) {
      const contact = contactsList[index]

      contact.givenName = contact.givenName ? contact.givenName : ''
      contact.familyName = contact.familyName ? contact.familyName : ''

      phoneContacts.push({
        key: contact.givenName +  contact.familyName,
        Name: contact.givenName + ' ' +  contact.familyName,
        usernameToLower: contact.givenName.toLowerCase() + ' ' + contact.familyName.toLowerCase(),
        phoneNumbers: contact.phoneNumbers,
        Phone: contact.phoneNumbers.length ? contact.phoneNumbers[0].number : null,
        Avatar: contact.thumbnailPath
      })
    }

    return new Promise(resolve => resolve(phoneContacts))
  }

  async getContactInApp (contact) {

    contactInApp = null
    contactAdded = false

    const curUser = global.currentUser

    for(var index in contact.phoneNumbers) {
      if(contactAdded) return

      let phone = contact.phoneNumbers[index]

      phone = PhoneToIndex(phone.number)

      const snaps = await FirebaseService.database()
        .ref('/users')
        .orderByChild('phoneIndex')
        .equalTo(phone)
        .once('value')

      if(snaps.exists()) {
        contactAdded = true

        snaps.forEach((snap) => {
          contactInApp = {
            ...snap.val(),
            key: snap.key,
            Key: snap.key
          }
        })

        contactInApp.isUserBlocked = false

        if(curUser) {
          contactInApp.isUserBlocked = await UserService.isUserBlocked(curUser.key, contactInApp.key)
        }
      }
    }

    return new Promise(resolve => resolve(contactInApp))
  }

  async refreshFriendsList(callback) {
    this.contacts = []

    const phoneContacts = await this.getContacts()

    for(var index in phoneContacts) {
      let contact = phoneContacts[index]

      let contactInApp = await this.getContactInApp(contact)

      if(contactInApp == null) continue
      if(contactInApp.isUserBlocked || contactInApp.invisible) continue

      this.contacts.push(contactInApp)
    }

    if(callback) callback(contactInApp)
  }

  async refreshContactsList(callback) {
    this.contacts = []

    const phoneContacts = await this.getContacts()

    for(var index in phoneContacts) {
      const contact = phoneContacts[index]
      const contactInApp = await this.getContactInApp(contact)

      if(contactInApp != null || contact.Phone == null || contact.isUserBlocked || contact.invisible) continue

      this.contacts.push(contact)
    }

    if(callback) callback(contactInApp)
  }
}

const loader = new ContactLoader()

export const refreshFriendsList = async(callback) => loader.refreshFriendsList(callback);

export const refreshContactsList = async(callback) => loader.refreshContactsList(callback)

class ContactRow  extends Component {
    constructor(props) {
      super(props)
      this.state = {
        item: props.item,
        otherItemData: props.otherItemData ? props.otherItemData : { requests: {}, friends: {} },
        index: props.index,
        onPress: props.onPress,
        countAllData: 0,
        isSelected: props.isSelected
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

    onPress() {
      this.setState({isSelected: !this.state.isSelected})

      if(this.state.onPress) this.state.onPress(this.state.item, this.state.index)
    }

    render() {
      const { item, index, isSelected } = this.state

      let Row = UserRow.component

      return  <Row item={item} otherItemData={this.state.otherItemData} index={index} onPress={() => this.onPress()} isSelected={isSelected} />
    }
}

export default {
    component: ContactRow,
    title: 'Contacts',
    path: 'users',
    key:'Phone',
    displayAllWhenEmpty: true,
    displayNbResults: true,
    deeperSearch: UserRow.deeperSearch,
    countAll: () => loader.contacts.length,
    resultsText: (nbData) => Translator.t('common.contact', {count: nbData}).toLowerCase(),
    specialBloc: (onPress) => {
      return <View style={{flex: 1}}>
        <TouchableOpacity onPress={() => onPress ? onPress() : null} style={[styles.listItemContainer, styles.lastColumnContainer]}>
          <View style={styles.button}>
              <Text style={{color: Colors.mainColor}}>Inviter Tous</Text>
          </View>
        </TouchableOpacity>
      </View>
    },
    search: (txt, callback) => {

      let results = loader.contacts.filter((contact) =>
        contact.usernameToLower && contact.usernameToLower.startsWith(txt.trim().toLowerCase()))

      if(txt.trim() == '') results = loader.contacts

      return callback(results)
    }
}

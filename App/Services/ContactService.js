import { PermissionsAndroid, Platform } from 'react-native'
import Contacts from 'react-native-contacts'

export default {
    async getAll() {

        return new Promise(resolve => {

            if (Platform.OS === 'ios') {
                Contacts.getAll((err, contacts) => {
                    if (err) return resolve([], err);
                    
                    return resolve(contacts)
                })
            } else if (Platform.OS === 'android') {
                PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: 'Contacts',
                        message: 'This app would like to view your contacts.'
                    }
                ).then(() => {
                    Contacts.getAll((err, contacts) => {
                        if (err === 'denied') return resolve([], err)
    
                        return resolve(contacts)
                    })
                })
            }
        })
        
    }
}
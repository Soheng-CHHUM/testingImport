import SendSMS from 'react-native-sms'
import FirebaseService from './Firebase'

export default {
    shareAppBySms(userKey, recipients, callback) {

        recipients.map(phoneNumber => {
            FirebaseService.database()
            .ref('/invites')
            .push({
                phoneNumber,
                fromKey: userKey,
                createdAt: (new Date()).valueOf()
            })
        })

        SendSMS.send({
            recipients,
            body: `BeBeep Share \r\n 
Utilisez BeBeep ! Pour communiquer en voiture avec les gens autour de toi !
https://bebeep.com/?lang=en`,
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true
        }, callback)
    }
}
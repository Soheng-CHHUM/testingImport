import FirebaseService, {handleError} from './Firebase'
import _ from 'lodash'

export default {

    async get(userKey) {
        const snap = await FirebaseService
                            .database()
                            .ref('settings/'+userKey)
                            .once('value')

        return new Promise(resolve => {
            return resolve(snap.val())
        })
    },

    listenOnAppSettings(callback) {

        this.dbRefAppSettings = FirebaseService
                                .database()
                                .ref('settings/app')

        return this.dbRefAppSettings.on('value', callback)
    },

    listenOnUserSettings(userKey, callback) {

        this.dbRefUserSettings = FirebaseService
                                .database()
                                .ref('settings/' + userKey)

        return this.dbRefUserSettings.on('value', callback)
    },

    stopListenOnAppSettings() {
        if(this.dbRefAppSettings) this.dbRefAppSettings.off('value')
    },

    stopListenOnUserSettings() {
        if(this.dbRefUserSettings) this.dbRefUserSettings.off('value')
    },

    getNbKmLimitZone(userKey, callback)
    {
        FirebaseService.database().ref('settings/'+userKey)
        .once('value', (snapshot) => {
            if(snapshot.val()){
                callback(snapshot.val());
            }else{
                callback(null);
            }
        });

    },

    updateNbKmLimitZoune(userKey, nbKm)
    {
        return FirebaseService.database()
            .ref('settings')
            .child("-LnkiFybOoZ-Tp2-gRel")
            .update({
                nbKmLimitZone: nbKm
            });
    },
    updateUserSetting(userKey, settingObject, isSettingExisting){
        const databaseRef = FirebaseService.database().ref('settings');

        if(isSettingExisting){
            return databaseRef.child(userKey).update(settingObject);
        }else{
            return databaseRef.child(userKey).set(settingObject);
        }
    },
    // createUserSetting(userKey){
    //     FirebaseService.database.ref('settings')
    //     .child(userKey)
    //     .push()
    // }





}

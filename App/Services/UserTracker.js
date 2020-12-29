import { AppState } from 'react-native'
import UserService, {STATUS_ONLINE, STATUS_OFFLINE} from './User'
import FirebaseService from './Firebase'

class UserTracker {

    isListeningOnChange() {
        return this.dbRef != null
    }

    isListeningOnFriendsChange() {
        return this.dbFriendsRef != null
    }

    setUser(user) {
        this.user = user

        this.handleAppStateChange('active')
    }

    start() {
        AppState.addEventListener('change', this.handleAppStateChange)
    }

    onChanged(callback) {

        if(!this.user || this.dbRef) return
        
        this.dbRef = FirebaseService.database().ref('/users/' + this.user.key)
    
        this.dbRef.on('value', snapshot => {
        
            if(!snapshot.exists() || snapshot.val() == null) return;
            
            return callback({...snapshot.val(), key: snapshot.key})
        });
    }

    onFriendsChanged(callback) {

        if(!this.user || this.dbFriendsRef) return
        
        this.dbFriendsRef = FirebaseService.database().ref('/friends/' + this.user.key)

        this.dbFriendsRef.on('value', snapshot => {
            if(!snapshot.exists() || snapshot.val() == null) return;

            let friends = {}

            snapshot.forEach(snap => {

                friends[snap.key] = {
                    ...snap.val(),
                    key: snap.key
                }
            })

            return callback(friends)
        })
    }

    stop() {
        AppState.removeEventListener('change', this.handleAppStateChange)

        if(this.dbRef) this.dbRef.off('value')

        if(this.dbFriendsRef) this.dbFriendsRef.off('value')

        this.dbRef = null
        this.dbFriendsRef = null
    }

    handleAppStateChange = (nextAppState) => {

        if(!this.user) return
        if(nextAppState == this.appState) return

        this.appState = nextAppState

        UserService.updateDevice(this.user, {appState: nextAppState});

        let status = STATUS_OFFLINE

        if (nextAppState === 'active') status = STATUS_ONLINE

        UserService.setStatus(this.user.key, status)
    }
}

const tracker = new UserTracker()

export default tracker
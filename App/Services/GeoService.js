import FirebaseService from './Firebase'

var queries = {
    users: {
        query: FirebaseService.geofire('/geo/users').query({
            center: [10.38, 2.41],
            radius: 10.5
        }),
        listeners: []
    },
    messages: {
        query: null,
        listeners: []
    },
    alerts: {
        query: FirebaseService.geofire('/geo/alerts').query({
            center: [10.38, 2.41],
            radius: 10.5
        }),
        listeners: []
    },
    danger_zones: {
        query: FirebaseService.geofire('/geo/danger_zones').query({
            center: [10.38, 2.41],
            radius: 10.5
        }),
        listeners: []
    }
}

export const USERS = 'users';
export const MESSAGES = 'messages';
export const ALERTS = 'alerts';
export const ALERTS_ZONE_DE_DANGER = 'danger_zones';

export default {

    isObservable: true,

    loopQueriesToUpdateCriteria(radius){
        for(var path in queries){
            this.setRadius(path, radius)
        }
    },

    locationToArray(location) {

        if(Array.isArray(location)) return location

        if(!location) return []

        return [location.latitude, location.longitude]
    },

    listenMessages(chatroomKey, callback, callbackRemove) {

        queries.messages.query = FirebaseService.geofire(`/geo/messages/${chatroomKey}`).query({
            center: [10.38, 2.41],
            radius: 10.5
        })

        return this.listen(MESSAGES, callback, callbackRemove)
    },

    listenUsers(callback, callbackRemove) {
        return this.listen(USERS, callback, callbackRemove)
    },

    listenAlerts(callback, callbackRemove) {
        return this.listen(ALERTS, callback, callbackRemove)
    },

    listenAlertsZoneDeDanger(callback, callbackRemove) {
        return this.listen(ALERTS_ZONE_DE_DANGER, callback, callbackRemove)
    },

    setUserLocation(userKey, location, callback) {
        if(!userKey) return false;
        location = this.locationToArray(location)

        this.updateCriteria(USERS, {
            center: location
        })

        this.updateCriteria(ALERTS_ZONE_DE_DANGER, {
            center: location
        })

        return this.setLocation(USERS, userKey, location, callback)
    },

    listen(path, callback, callbackRemove) {
        if(!queries[path] || !queries[path].query) return
        
        queries[path].listeners = [
            queries[path].query.on('key_entered', function(key, location, distance) {
                callback(key, location, distance)
            }),
            queries[path].query.on('key_moved', function(key, location, distance) {
                callback(key, location, distance)
            }),
            queries[path].query.on('key_exited', function(key, location, distance) {
                if(callbackRemove) return callbackRemove(key, location, distance)
            })
        ]
    },

    stopListen(path) {
        if(!queries[path]) return
        queries[path].listeners.map(listener => listener.cancel())
        queries[path].listeners = []
    },

    setRadius(path, radius) {
        this.updateCriteria(path, {
            radius
        })
    },

    setLocation(path, key, location, callback) {
        location = this.locationToArray(location)
        this.setLocationWithoutRecording(path, location)

        if(path == USERS && !this.isObservable) return

        return this.recordLocation(path, key, location, callback)
    },
    
    setParkingLocation(location){
        location = this.locationToArray(location)
        this.updateCriteria(ALERTS, {
            center: location
        })
    },

    registerAlertPvLocation(alertKey, location, callback) {
        return this.recordLocation(ALERTS, alertKey, location, callback)
    },

    registerAlertZoneDeDangerLocation(alertKey, location, callback) {
        return this.recordLocation(ALERTS_ZONE_DE_DANGER, alertKey, location, callback)
    },

    recordLocation(path, key, location, callback) {
        FirebaseService.geofire(`/geo/${path}`).set(key, location).then(() => callback(key, true), (err) => callback(key, false, err))
    },

    setLocationWithoutRecording(path, location) {

        location = this.locationToArray(location)

        this.updateCriteria(path, {
            center: location
        })
    },

    removeAlertPv(key, location, callback) {
        FirebaseService.geofire(`/geo/${ALERTS}`)
        .remove(key, location)
        .then(() => callback(true), (err) => callback(false, err))
    },

    removeAlertZoneDeDanger(key, location, callback) {
        FirebaseService.geofire(`/geo/${ALERTS_ZONE_DE_DANGER}`)
        .remove(key, location)
        .then(() => callback(true), (err) => callback(false, err))
    },

    removeLocation(path, key, location, callback) {
        FirebaseService.geofire(`/geo/${path}`)
        .remove(key, location)
        .then(() => callback(true), (err) => callback(false, err))
    },

    getLocation(path, key, callback) {
        FirebaseService.database().ref(`/geo/${path}/${key}`)
        .once('value', (snapshot) => {
            if(snapshot.val()){
                let location = snapshot.val()['l'];
                callback(location);
            }else{
                callback(null);
            }
        });
    },

    updateCriteria(path, criterias) {
        if(!queries[path] || !queries[path].query) return
        queries[path].query.updateCriteria(criterias)
    }
}

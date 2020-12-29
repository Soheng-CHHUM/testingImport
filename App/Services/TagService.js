import FirebaseService from './Firebase'

export default {
    create: (userKey, content, callback) => {
        if(!content) return callback ? callback(null) : null

        content = content.trim().toLowerCase()

        FirebaseService.database().ref('/tags')
        .orderByChild('content')
        .equalTo(content)
        .once('value', (snap) => {
            if(snap.exists()) return

            let key = FirebaseService.database().ref('/tags')
            
            .push({
                content,
                createdBy: userKey,
                usedNbTimes: 1
            }).key

            return callback ? callback(key) : null
        })
    }
}
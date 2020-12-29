import FirebaseService from './Firebase'
import _ from 'lodash'
class Searcher {
  dbRef = null

  searchQuery(path, field, text, userKey, callback) {
    if (text) {

      this.dbRef = FirebaseService.database()
        .ref(path)
        .orderByChild(field)
        .startAt(text)
        .endAt(text + "\u{F8FF}")
        .limitToFirst(20)

      return this.dbRef.once('value', snaps => callback(snaps))

    } else {
      if(path=="users"){
        this.dbRef = FirebaseService.database()
          .ref(path)
          // .orderByChild('isDeleted').equalTo(false)
          .limitToFirst(20)
        
        this.dbFriendsRequests = FirebaseService.database()
          .ref('friends-requests/'+userKey+'/sent');
        
        this.dbFriends = FirebaseService.database()
          .ref('friends').child(userKey);
        
        return this.dbRef.once('value', usersData => {
          var newFriendsAndFriendsRequestsObject = [];
          this.dbFriendsRequests.once('value', friendsRequests => {
            if(friendsRequests.val()){
              const getAllFriendRequestKey = Object.keys(friendsRequests.val())
              getAllFriendRequestKey.map((eachFriendRequestKey)=>{
                newFriendsAndFriendsRequestsObject.push({
                  key: eachFriendRequestKey,
                  relationship: 'invited'
                })
              })
            }

            this.dbFriends.once('value', friends => {
              if(friends.val()){
                const getAllFriendsKey = Object.keys(friends.val())
                getAllFriendsKey.map((eachFriendRequestKey)=>{
                  newFriendsAndFriendsRequestsObject.push({
                    key: eachFriendRequestKey,
                    relationship: 'friend'
                  })
                })
              }
              newFriendsAndFriendsRequestsObjectUniqueByKey = _.uniqBy(newFriendsAndFriendsRequestsObject.reverse(), 'key')
              const getAllUsersKey = Object.keys(usersData.val())
              let newUsersData = []
              getAllUsersKey.map((eachUserKey)=>{
                if(eachUserKey){
                  checkExistingUserKey = _.filter(newFriendsAndFriendsRequestsObjectUniqueByKey, { key: eachUserKey })[0]
                  if(checkExistingUserKey){
                    let mergeUserObj = {...usersData.val()[eachUserKey], ...checkExistingUserKey}
                    newUsersData.push(mergeUserObj)
                    // newUsersData = {...newUsersData, ...{[eachUserKey]: mergeUserObj} }
                  }else{
                    let mergeUserObj = {...usersData.val()[eachUserKey], ...{relationship: 'invite'}}
                    newUsersData.push(mergeUserObj)
                    // newUsersData = {...newUsersData, ...{[eachUserKey]: mergeUserObj} }
                  }
                }
              })
              // return callback(usersData)
              return callback(newUsersData)
             
            });

          });

        });

      }else{
        this.dbRef = FirebaseService.database()
          .ref(path)
          .orderByChild(field)
          // .limitToFirst(8)
          .limitToLast(8)
        
        return this.dbRef.once('value', snaps => {
          callback(snaps)
        });
      }
    }
  }

  filterFriendsAndFriendsRequest(userKey, callback){
        this.dbFriendsRequests = FirebaseService.database()
          .ref('friends-requests/'+userKey+'/sent');
        this.dbFriends = FirebaseService.database()
          .ref('friends').child(userKey);
          var newFriendsAndFriendsRequestsObject = [];
        return this.dbFriendsRequests.once('value', friendsRequests => {
            if(friendsRequests.val()){
              const getAllFriendRequestKey = Object.keys(friendsRequests.val())
              getAllFriendRequestKey.map((eachFriendRequestKey)=>{
                newFriendsAndFriendsRequestsObject.push({
                  key: eachFriendRequestKey,
                  relationship: 'invited'
                })
              })
            }

            this.dbFriends.once('value', friends => {
              if(friends.val()){
                const getAllFriendsKey = Object.keys(friends.val())
                getAllFriendsKey.map((eachFriendRequestKey)=>{
                  newFriendsAndFriendsRequestsObject.push({
                    key: eachFriendRequestKey,
                    relationship: 'friend'
                  })
                })
              }
              newFriendsAndFriendsRequestsObjectUniqueByKey = _.uniqBy(newFriendsAndFriendsRequestsObject.reverse(), 'key')
              return callback(newFriendsAndFriendsRequestsObjectUniqueByKey)
            });

          });
  }


  off() {
    if(this.dbRef) this.dbRef.off('value')

    this.dbRef = null
  }
}

const searcher = new Searcher()

export default searcher

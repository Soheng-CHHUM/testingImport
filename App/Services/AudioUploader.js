import {
    Platform
} from 'react-native'

import RNFetchBlob from 'rn-fetch-blob'

import FirebaseService from '../Services/Firebase'

const storageRef = FirebaseService.storage().ref('audios');
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs

export default {
    uploadAudio(audioPath, mime = 'application/octet-stream') {

        return new Promise((resolve, reject) => {

            if(!audioPath || audioPath.trim() == '') return reject()
            
            const uploadUri = Platform.OS === "ios" ? audioPath : `file://${audioPath}`;
        
            const sessionId = new Date().getTime() + '.aac'
            let uploadBlob = null
            const audioRef = storageRef.child(`${sessionId}`)
            
            return fs.readFile(uploadUri, 'base64')
              .then((data) => {
                return Blob.build(data, { type: `${mime};BASE64` })
              })
              .then((blob) => {
                uploadBlob = blob

                if(!uploadBlob) throw 'error with blob'

                return audioRef.put(blob._ref, { contentType: mime })
              })
              .then(() => {
                uploadBlob.close()
                return audioRef.getDownloadURL()
              })
              .then((url) => {
                return resolve({url, filename: sessionId})
              })
              .catch((error) => {
                return reject(error)
              })
        });
    }
}
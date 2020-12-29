import FirebaseService from './Firebase';
import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const storage = FirebaseService.storage()
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs

export default {
    upload(uri, mime = 'application/octet-stream') {
        return new Promise((resolve, reject) => {
          const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
          
          const sessionId = new Date().getTime()
          let uploadBlob = null
          const imageRef = storage.ref('images').child(`${sessionId}`)
          
          fs.readFile(uploadUri, 'base64')
            .then((data) => {
              return Blob.build(data, { type: `${mime};BASE64` })
            })
            .then((blob) => {
              uploadBlob = blob
              return imageRef.put(blob._ref, { contentType: mime })
            })
            .then(() => {
              uploadBlob.close()
              return imageRef.getDownloadURL()
            })
            .then((url) => {
              resolve(url)
            })
            .catch((error) => {
              reject(error);
          })
        })
    }
}
/* ***********************************************************
* A short word on how to use this automagically generated file.
* We're often asked in the ignite gitter channel how to connect
* to a to a third party api, so we thought we'd demonstrate - but
* you should know you can use sagas for other flow control too.
*
* Other points:
*  - You'll need to add this saga to sagas/index.js
*  - This template uses the api declared in sagas/index.js, so
*    you'll need to define a constant in that file.
*************************************************************/

import { call, put } from 'redux-saga/effects'
import PrepareAssetsActions from '../Redux/PrepareAssetsRedux'
// import { PrepareAssetsSelectors } from '../Redux/PrepareAssetsRedux'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

export function * start () {
  const soundsPath = `${RNFS.DocumentDirectoryPath}/sounds`
  const filenames = ['alert.wav', 'alert_pv.wav', 'alert_zone.wav']

  let exists = yield RNFS.exists(soundsPath).then((exists) => exists)

  if(!exists) {
    yield RNFS.mkdir(soundsPath)
  }

  for(var i in filenames) {
    let filename = filenames[i]

    exists = yield RNFS.exists(`${soundsPath}/${filename}`)

    if(exists) yield RNFS.unlink(`${soundsPath}/${filename}`)
    
    if(Platform.OS == 'android') yield RNFS.copyFileRes(filename, `${soundsPath}/${filename}`)
    else {
      yield RNFS.copyFile(`${RNFS.MainBundlePath}/${filename}`, `${soundsPath}/${filename}`) //ios
    }
  }

  yield put(PrepareAssetsActions.prepareAssetsSuccess(`sounds/*`))
}

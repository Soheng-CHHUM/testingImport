import { StyleSheet } from 'react-native'

import ApplicationStyles from '../../Themes/ApplicationStyles'

export default StyleSheet.create({
  container: {
    ...ApplicationStyles.radioAvatar, 
    borderWidth: 0
  },
  containerNoPicture: {
    ...ApplicationStyles.radioAvatar, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B360D2',
    borderRadius: 15
  },
  text: {
    fontSize:24,
    color:'white'
  }
})

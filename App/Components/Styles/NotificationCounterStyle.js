import { StyleSheet } from 'react-native'
import Colors from '../../Themes/Colors'

export default StyleSheet.create({
  container: {
    flex: 1
  },
  notificationContainer: {
    position: 'absolute', 
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mainColor, 
    width: 18, 
    height: 18,
    padding: 0
  },
  notificationMessage: {
    alignSelf: 'center',
    padding: 0,
    color: Colors.white,
    fontSize: 16
  }
})

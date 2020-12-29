import { StyleSheet, Dimensions } from 'react-native'
import ApplicationStyles from '../../Themes/ApplicationStyles'

export default StyleSheet.create({
  ...ApplicationStyles.search,
  container: {
    flex: 1,
    width: Dimensions.get('window').width

  },
  messageList: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20, 
    backgroundColor: 'white'
  },
  imgAvatarRound: {
    marginBottom: 40,
    width: 150,
    height: 150,
    borderRadius: 150 / 2
  },
  menuList: {
    backgroundColor: 'white',
    width: Dimensions.get('window').width - 20,
    borderRadius: 10
  },
  menuItem: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.10)'
  },
  textButton: {
    fontSize: 16,
  },
  verticalLine: {
    borderBottomColor: '#3F3F3F',
    borderBottomWidth: 0.7,
  },
})

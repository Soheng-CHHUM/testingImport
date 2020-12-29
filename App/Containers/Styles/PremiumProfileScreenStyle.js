import { StyleSheet } from 'react-native'
import { Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20

  },
  profileContainer: {
    flexDirection: 'row'
  },
  crossButton: {
    right: 0,
    position: 'absolute',
    marginRight: 16
  },
  imgContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginLeft: 28,
    marginTop: 18
  },
  imgProfile: {
    width: 100,
    height: 100,

  },
  txtName: {
    color: 'white',
    bottom: 0,
    position: 'absolute',
    left: 140,
    fontSize: 24
  },
  profileText:{
    marginTop: 16,
    paddingLeft: 16,
    justifyContent: 'space-between'
  },
  txtName1: {
    color: 'white',
    fontSize: 24,
  },
  menu: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  horizontalLine: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#707070'
  },
  txtMenu: {
    fontSize: 22,
    margin: 20
  }
})

import { StyleSheet } from 'react-native'
import {Metrics, Colors, Fonts, ApplicationStyles} from '../../Themes'

export default StyleSheet.create({
  ...ApplicationStyles.search,
  container: {
    flex: 1
  },
  imgAvatarRound: {
    marginBottom: 40,
    width: 150,
    height: 150,
    borderRadius: 150 / 2
  },
  menuList: {
    backgroundColor: 'white',
    width: Metrics.screenWidth - 20,
    borderRadius: 10
  },
  textButton: {
    fontSize: 16,
  },
  menuItem: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.10)'
  },
  verticalLine: {
    borderBottomColor: '#3F3F3F',
    borderBottomWidth: 0.7,
  },
  /* Premium Pop up */
  dialogPremium: { 
    position: 'absolute', 
    bottom: 0,
    height: '95%',
    backgroundColor: 'black'
  },
  crossButton: {
    top: 10,
    right: 0,
    position: 'absolute',
    zIndex: 10000,
    marginRight: 16
  },
  premiumContainer: {
    flex: 1,
    paddingLeft: 28,
    paddingTop: 18,
    width: Metrics.screenWidth,
  },
  profileContainer: {
    flexDirection: 'row'
  },
  imgContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
  },
  imgProfile: {
    width: 80,
    height: 80,
  },
  profileText:{
    paddingLeft: 20,
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
  txtMenuSelected: {
    color: '#B360D2',
    fontSize: 22,
    margin: 20
  },
  iconMenuSelected: { 
    color: '#B360D2', 
    paddingRight: 8 
  },
  txtMenu: {
    ...Fonts.style.normal,
    color: 'white',
    margin: 20
  },
  iconMenu: { 
    color: 'white', 
    paddingRight: 8 
  }
})

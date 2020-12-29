import { StyleSheet } from 'react-native'
import { Colors, Metrics, ApplicationStyles } from '../../Themes'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    padding: 0,
    margin: 0
  },
  dialog: { 
    position: 'absolute', 
    bottom: -20, 
    height: '60%',
    backgroundColor: Colors.white 
  },
  contentContainer: {
    height: '100%',
    padding: 0
  },
  closeButtonContainer: {
    position: "absolute",
    top: 10,
    right: 15
  },
  roundButton: {
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: 65,
      height: 65,
      borderRadius: 65,
      position: 'absolute',
      bottom: 10
  },
  btnConfirmContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30
  },
  descriptionContainer: {
    padding: 0
  },
  titleContainer: {
    padding: 0,
    margin: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center'
  },
  txtDescription: {
    ...ApplicationStyles.screen.paragraph,
    textAlign: 'center'
  },
  chatButton: {
      flex: 2,
      borderRadius: 14,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center'
  },
  roundPlayButton: {
      zIndex: 10,
      borderColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      width: 50,
      height: 50,
      backgroundColor: 'transparent',
      borderRadius: 50,
  },
  btnConfirmInnerColumn: {
    flex: 1,
    padding: 20
  }
})

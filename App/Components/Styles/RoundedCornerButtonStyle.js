import { StyleSheet } from 'react-native'
import {Fonts, Colors} from '../../Themes'

export default StyleSheet.create({
  container: {
    //flex: 1,
    position: 'relative'
  },
  btnConfirmStyle: {
    flex: 1
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    backgroundColor: 'blue',
    paddingRight: 15,
    borderRadius: 15,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  buttonText: {
      ...Fonts.style.input,
      padding: 0,
      margin: 0,
      textAlign: 'center'
  },
})

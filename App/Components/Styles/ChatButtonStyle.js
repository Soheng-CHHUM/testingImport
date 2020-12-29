import { StyleSheet } from 'react-native'

import {Colors, Fonts, Metrics} from '../../Themes'

export default StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Metrics.menu.bottom.paddingCornerBottom,
    height: '100%',
    width: '35%',
    left: 0,
  },
  smallImage: {
    padding: 0,
    margin: 0,
    height: Metrics.icons.medium,
    alignSelf: 'center',
  },
  image: {
    padding: 0,
    margin: 0,
  },
  text: {
    textAlign: 'center',
    padding: 0,
    margin: 0,
    lineHeight: Fonts.size.medium,
    color: Colors.white,
    fontFamily: Fonts.type.base,
    fontSize: Fonts.size.medium,
    fontWeight: '400',
    letterSpacing: -0.15,
  }
})

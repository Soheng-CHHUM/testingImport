import {Dimensions, Platform} from 'react-native'

const { width, height } = Dimensions.get('window')

// Used via Metrics.baseMargin
const metrics = {
  marginHorizontal: 10,
  marginVertical: 10,
  section: 25,
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallMargin: 5,
  doubleSection: 50,
  horizontalLineHeight: 1,
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
  navBarHeight: (Platform.OS === 'ios') ? 64 : 54,
  buttonRadius: 4,
  popUpRadius: 20,
  list: {
    line: {
      width,
      height: 80
    }
  },
  menu: {
    bottom: {
      medium : 90,
      paddingBottom: 10,
      paddingCornerBottom: 15
    }
  },
  icons: {
    tiny: 12,
    small: 20,
    medium: 35,
    large: 45,
    xl: 50
  },
  images: {
    small: 20,
    medium: 46,
    large: 60,
    xl: 80,
    logo: 200
  },
  buttons: {
    bottom: {
      x: 35
    },
    small: 50,
    medium: 60,
    large: 85
  }
}

export default metrics

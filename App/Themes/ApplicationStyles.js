import Fonts from './Fonts'
import Metrics from './Metrics'
import Colors from './Colors'
import { Dimensions } from 'react-native'
// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android

const ApplicationStyles = {
  screen: {
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.transparent
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    },
    container: {
      flex: 1,
      paddingTop: Metrics.baseMargin,
      backgroundColor: Colors.transparent
    },
    section: {
      margin: Metrics.section,
      padding: Metrics.baseMargin
    },
    sectionText: {
      ...Fonts.style.normal,
      paddingVertical: Metrics.doubleBaseMargin,
      color: Colors.snow,
      marginVertical: Metrics.smallMargin,
      textAlign: 'center'
    },
    subtitle: {
      color: Colors.snow,
      padding: Metrics.smallMargin,
      marginBottom: Metrics.smallMargin,
      marginHorizontal: Metrics.smallMargin
    },
    titleText: {
      ...Fonts.style.title,
      color: Colors.black
    },
    paragraph: {
      ...Fonts.style.normal,
      color: Colors.black
    },
    messageInfoContainer: {
      marginLeft: 15,
      padding: 0,
      flexDirection: 'column',
      flex: 0.8,
    },
    textBigInfo: {
      ...Fonts.style.bigInfo,
      color: Colors.black
    },
    textMediumInfo: {
      ...Fonts.style.input,
      color: Colors.disabled,
    },
    textSmallInfo: {
      flex: 0.2,
      ...Fonts.style.normal,
      //fontSize: 16,
    }
  },
  search: {
    containerSearchIcon: {
      flex: 1,
      height: Metrics.doubleSection,
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'center'
    },
  },
  imageBloc: {
    reqAvatar:{
      borderRadius: 12,
      width: 50,
      height: 50,
      marginLeft: 22
    },
    imageAvatar:{
      width: 30,
      height: 30,
      resizeMode: 'cover',
      borderRadius: 8,
      position: 'absolute',

    },
    frontImage:{
      width: '100%',
      height: '100%'
    },
  },
  darkLabelContainer: {
    padding: Metrics.smallMargin,
    paddingBottom: Metrics.doubleBaseMargin,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    marginBottom: Metrics.baseMargin
  },
  darkLabel: {
    fontFamily: Fonts.type.bold,
    color: Colors.snow
  },
  groupContainer: {
    margin: Metrics.smallMargin,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  sectionTitle: {
    ...Fonts.style.h4,
    color: Colors.coal,
    backgroundColor: Colors.ricePaper,
    padding: Metrics.smallMargin,
    marginTop: Metrics.smallMargin,
    marginHorizontal: Metrics.baseMargin,
    borderWidth: 1,
    borderColor: Colors.ember,
    alignItems: 'center',
    textAlign: 'center'
  },
  topLine: {
    height: 5,
    backgroundColor: '#CCCCCC',
    width: 48,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'center'
  },
  button: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    height: 50,
    borderRadius: 15,
  },
  linearGradiantButton: {
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    borderRadius: 15
  },
  circle: {
    position: 'absolute',
    borderRadius: 45,
    top: -2,
    right: -2,
    height: 14,
    width: 14,
    zIndex: 2
  },
  radioAvatar: {
    width: 50,
    height: 50,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txtDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: 'black'
},
}

export default ApplicationStyles

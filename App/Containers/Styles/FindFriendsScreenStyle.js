import { StyleSheet } from 'react-native'
import { Colors, Metrics, ApplicationStyles } from '../../Themes'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    flex: 1,
  },
  listContainer: {
    height: '100%',
  },
  pageContainer: {
    paddingTop: Metrics.marginVertical,
    paddingLeft: Metrics.marginHorizontal,
    paddingRight: Metrics.marginHorizontal
  },
  innerContainer: {
    // paddingLeft: Metrics.marginHorizontal
  },
  doneButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center'
  }
})

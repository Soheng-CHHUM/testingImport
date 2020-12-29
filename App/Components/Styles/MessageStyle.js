import { StyleSheet } from 'react-native'
import {Colors, Metrics, ApplicationStyles} from '../../Themes'

const SAVE_BUTTON_BOTTOM = Metrics.menu.bottom.paddingBottom
const SAVE_BUTTON_PROGRESS_SIZE = 4

export default StyleSheet.create({
  /*container: {
    flexDirection: 'column',
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 10,
  },*/
  ...ApplicationStyles.screen,
  container: { 
    flexDirection: 'row', 
    marginTop: 16, 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  firstCol: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  pictureContainer: {
    marginTop: 10
  },
  createdTimeText: {
    color: Colors.darkgrayColor, 
    fontSize: 14
  },
  secondCol: {
    flexDirection: 'row', 
    marginTop: 5
  },
  slider: {
    flex: 1
  },
  buttonsContainer: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  timeContainer: {
    marginRight: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    // backgroundColor: Colors.lighgrayColor,
    borderRadius: 10
  },
  elapsedTimeText: {
    fontSize: 16
  },
  buttonsInner: {
    margin: 0,
    flex: 0.2,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  buttonContainer: {
    padding: SAVE_BUTTON_PROGRESS_SIZE / 2,
  },
  progressContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex:20000
  },
  progress: {
    color: Colors.mainColor,
    width: SAVE_BUTTON_PROGRESS_SIZE
  },
  buttonStopContainer: {
    backgroundColor: Colors.transparent,
    borderRadius: 100,
    width: 38,
    height: 38,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  buttonPlayContainer: {
    borderRadius: 100,
    width: 38,
    height: 38,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  buttonStop: {
    width: 8, 
    height: 9, 
    tintColor: Colors.mainColor
  },
  buttonPlay: {
    width: 8, 
    height: 9, 
    tintColor: Colors.white
  },
})

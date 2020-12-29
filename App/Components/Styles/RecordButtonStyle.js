import { StyleSheet } from 'react-native'
import {Colors, Fonts, Metrics} from '../../Themes'

const SAVE_BUTTON_BOTTOM = Metrics.menu.bottom.paddingBottom
const SAVE_BUTTON_PROGRESS_SIZE = 6

export default StyleSheet.create({
  container: {
    flex: 1
  },
  modalRecordingShow: {
    flex: 1, 
    position: 'relative',
    padding: 0,
    margin: 0,
    backgroundColor: Colors.backgroundPopUp
  }, 
  modalButtonsContainer: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recordCancelContainer: {
    borderRadius: 100,
    padding: 0,
    margin: 0,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black
  },
  sliderContainer: {
    alignItems: 'center', 
    alignSelf: 'center'
  },
  recordSaveButtonContainer: {
    padding: 0,
    margin: 0
  },
  progressContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex:20000,
    bottom: SAVE_BUTTON_BOTTOM
  },
  recordSaveContainer: {
    paddingHorizontal: SAVE_BUTTON_PROGRESS_SIZE,
    margin: 0, 
    paddingTop: 0,
    paddingBottom: SAVE_BUTTON_BOTTOM,
  },
  recordSaveGradient: {
    borderRadius: 100,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: SAVE_BUTTON_BOTTOM,
    zIndex: 10000,
    alignSelf:'center',
  },
  recordButtonContainer: {
      padding: 0,
      borderRadius: 100,
      overflow: 'hidden',
  },
  progress: {
    color: Colors.white,
    width: SAVE_BUTTON_PROGRESS_SIZE
  },
  recordButtonGradient: {
    height: '100%',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  
  optionImage: {
    
  },
  recordSaveImage: {
    height: '100%', 
    width: '100%', 
  },
  sliderGradient: {
    width: 160, 
    height: 50, 
    marginTop: 30, 
    borderRadius: 40, 
    justifyContent: 'center'
  },
  
  slider: {
    marginRight: 10, 
    flex: 1
  },
  modalMessageContainer: {
    flex: 2.5,
    paddingBottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 25
  },
  modalTitleContainer: {
    marginBottom: 20
  },
  text: {
    color: Colors.white,
    ...Fonts.style.normal
  }
})

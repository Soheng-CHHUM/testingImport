import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
    ...ApplicationStyles.screen,
    container: {
        paddingBottom: Metrics.baseMargin
    },
    roundButton: {
        zIndex: 10,
        // borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 65,
        height: 65,
        borderRadius: 65,
        position: 'absolute',
        bottom: 10
    },
    chatButton: {
        flex: 2,
        // backgroundColor: 'black',
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

})

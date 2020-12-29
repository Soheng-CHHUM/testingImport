import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    switchBottonContainer: {
        flex: 1, height: 50, flexDirection: 'row', backgroundColor: 'red',
        justifyContent: 'space-between', alignItems: 'center'
    },
    sliderContainer: {
        width:'100%',
        // marginLeft: 10,
        // marginRight: 10,
        // alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection:'column'
    }
})
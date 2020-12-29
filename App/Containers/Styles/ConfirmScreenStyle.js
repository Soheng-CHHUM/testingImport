import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1, flexDirection: 'column',
        paddingLeft: 18, paddingRight: 10, paddingTop: 10
    },
    textContainer: {
        height: 50, flexDirection: 'row', alignItems: 'center'
    },
    textStyle: {
        marginRight: 7, fontSize: 26, fontWeight: 'bold',textAlign:'center'
    },
    textInputContainer: {
        flex: 1, height: 60, marginTop: 45, marginBottom: 10 
    },
    bottonContinuerStyle: {
        justifyContent: 'center', backgroundColor: '#aeb1b5', borderRadius: 15 
    },
    textBottonStyle: {
        color: 'white', padding: 10, fontSize: 22
    }
})
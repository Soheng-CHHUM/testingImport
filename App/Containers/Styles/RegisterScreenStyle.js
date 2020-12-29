import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1, flexDirection: 'column',
        paddingLeft: 18, paddingRight: 10,
        paddingTop: 10,
        backgroundColor:'red'
    },
    textContainer:{
        height: 50, flexDirection: 'row', alignItems: 'center'
    },
    textStyle:{
        marginRight: 7, fontSize: 25, fontWeight: 'bold',color:'black'
    },
    textInputContainer:{
        flex: 1, height: 50, marginTop: 45, marginBottom: 10
    },
    subTextInputContainer:{
        flexDirection: 'row', justifyContent: 'space-between'
    },
    textInputStyle:{
        fontSize:18,color: '#B360D2', textAlign: 'center'
    },
    switchBottonContainer:{
        flex: 1, height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    bottonContinuerStyle:{
        justifyContent: 'center', backgroundColor: '#aeb1b5', borderRadius: 15
    },
    textBottonStyle:{
        color: 'white', padding: 10, fontSize: 22
    }
})

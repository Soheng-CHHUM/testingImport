import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'flex-end'
    },
    popUpContainer:{
        backgroundColor: 'white',
        alignItems: 'center',
        height: '30%',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingLeft: 32,
        paddingRight: 32
    },
    crossButton:{
        margin: 20,
        position: 'absolute',
        top: 0
    },
    txtPopUptitleContainer:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    txtPopUpTitle:{
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold'
    },
    textContainer:{
        paddingLeft: 20,
        paddingBottom: 20
    },
    txtPopUpDesc:{
        fontSize: 18,
        color: 'black',
        marginTop: 20
    },
    popUpButton:{
        padding: 10,
        borderRadius: 10,
        position: 'absolute',
        width: '100%',
        bottom: 0,
        marginBottom: 20,
        alignItems: 'center'
        
    },
    textButton:{
        color: 'white',
        fontSize: 18
    }
});
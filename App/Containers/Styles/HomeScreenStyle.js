import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        height: '100%'
    },
    imgStyle: {
        height: 120, justifyContent: 'center', alignSelf: 'center'
    },
    viewTextStyle: { marginBottom:10, marginTop: 10
    },
    textStyle: {
        textAlign: 'center', color: 'white', fontSize: 17
    },
    bottonContainer:{
        height: 80, justifyContent: 'space-evenly', flexDirection: 'column'
    },
    touchOpacity:{
        justifyContent: 'center', backgroundColor: 'white', borderRadius: 15,height:50
    },
    bottonText:{
        color: '#AC57C3', padding: 10, fontSize: 18
    },
    touchOpacityNoColor:{
        justifyContent: 'center', height:50,borderWidth: 1, borderColor: 'white', borderRadius: 15
    },
    bottomSmallText:{
        textAlign: 'center', color: 'white', fontSize: 12,width:'100%'
    },
     linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
})

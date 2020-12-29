import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        backgroundColor: "white", paddingLeft: 20, paddingRight: 20,height:'100%'
    },
    textContainer: {
        height: 110, width: "100%", paddingLeft: 10
    },
    textStyle: {
        paddingTop: 10, fontSize: 28, fontWeight: 'bold',color:'black'
    },
    contactContainer: {
        paddingLeft: 10, height: 50, flexDirection: 'row',
        justifyContent: 'space-between',paddingBottom:10
    },
    contactText: {
        fontSize: 16, color: '#B360D2', paddingTop: 8,fontWeight:'bold'
    },
    contactBottonContainer: {
        flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end'
    },
    contactBottonTextContainer: {
        borderRadius: 15, borderWidth: 1, borderColor: '#b61fd1',
        paddingLeft: 15, paddingRight: 15, paddingTop: 5, paddingBottom: 8
    },
    contactBottonText: {
        fontSize: 16, color: '#b61fd1'
    },
    inviteContainer: {
        paddingLeft: 10, height:70, flexDirection: 'row', justifyContent: 'space-between'
    },
    inviteTextContainer: {
        fontSize: 16, fontWeight: 'bold', color: 'black', paddingTop: 8
    },
    inviteBottonContainer: {
        flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end'
    },
    inviteBottonText: {
        borderRadius: 12, backgroundColor: '#B360D2', paddingLeft: 15, paddingRight: 15, paddingTop: 5, paddingBottom: 5, flexDirection: 'row'
    },
    inviteText: {
        fontSize: 16,color: 'white', paddingLeft: 10
    },

    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5,
        borderRadius: 15
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
        alignSelf:'center',
        alignItems:'center'
    },
})

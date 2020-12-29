import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1, flexDirection: 'column', paddingLeft: 18,
        paddingRight: 10, paddingTop: 10
    },
    RowContainer:{
        height: 50, flexDirection: 'row', alignItems: 'center'
    },
    topTextStyle:{
        marginRight: 7, fontSize: 21, fontWeight: 'bold',color:'black'
    },
    passwordContainer:{
        height: 50, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30
    },
    bottonContainer:{
        justifyContent: 'center', backgroundColor: '#aeb1b5', borderRadius: 15,height:50
    },
    bottonText:{
        color: 'white', padding: 10, fontSize: 18
    }
})

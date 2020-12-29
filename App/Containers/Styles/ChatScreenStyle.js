import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    backgroundBottomNav: {
        zIndex: 1,
        marginTop: -20,
        height: 100,
        width: '100%',
        bottom: -15,
        position: 'absolute',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    btnTitleContainer: {
        marginTop: 8,
        paddingLeft: 32,
        paddingRight: 18,
        flexDirection: 'row',
        marginBottom: 8
    },
    chatButton: {
        flex: 3,
        // backgroundColor: 'black',
        borderRadius: 14,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        // width: Dimensions.get('window').width - 40
    },
    btnBottomNav: {
        flex: 1,
        paddingTop: 28,
        alignItems: 'center'
    },
    recordButton: {
        flex: 1,
        marginTop: 4,
        top: -15
    },
    descriptionContainer: {
        padding: 16
    },
    txtDescription: {
        fontSize: 18,
        textAlign: 'center',
        color: 'black'
    },
    btnConfirmContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    },
    btnConfirmStyle: {
        borderWidth: 1,
        borderColor: '#707070',
        height: 45,
        width: 140,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    searchContainer: {
        flex: 0.6,
        justifyContent:'center',
        alignItems: 'center',
        height: 36
    }

})
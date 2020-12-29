import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    inputContainter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    txtLength: {
        color: '#B360D2'
    },
    txtInput: {
        height: 40,
        backgroundColor: '#fff',
        padding: 5,
        fontSize: 28
    },

    /**
    * GROUP TYPE SCREEN
    */
    container: {
        flex: 1,
        padding: 20
    },
    bigTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black'
    },
    description: {
        fontSize: 18,
        color: 'black'
    },
    subContainer: {
        flex: 1,
        // justifyContent: 'center',
        marginTop:'20%'
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    subTitle: {
        fontSize: 22,
        color: 'black',
        fontWeight: 'bold'
    },
    subDescription: {
        fontSize: 18,
        color: 'black'
    },
    radio: {
        width: 25,
        height: 25,
        borderColor: '#B360D2',
        borderWidth: 1,
        borderRadius: 50
    }

});

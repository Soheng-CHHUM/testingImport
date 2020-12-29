import React, { Component } from 'react'

import { Text, View, TouchableOpacity } from 'react-native'

import Translator from '../../Translations/Translator'

import { Icon } from 'native-base'

class GoBack extends React.PureComponent {

    onPress() {
        const { navigation, onPress } = this.props

        if(onPress) onPress()

        navigation.goBack()
    }

    render () {
        return (
            <TouchableOpacity onPress={() => this.onPress()} style={{ paddingLeft: 12 }}>
                <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#b61fd1' }} />
            </TouchableOpacity>
        )
    }
}

class GoForward extends React.PureComponent {

    onPress() {
        const { navigation, nextScreen, onPress } = this.props

        if(onPress) onPress()
        
        navigation.navigate(nextScreen)
    }

    render() {
        

        return (
            <TouchableOpacity onPress={() => this.onPress()} style={{ paddingRight: 12 }}>
                <Text style={{ fontSize: 18, color: 'grey' }}>{Translator.t('common.pass')}</Text>
            </TouchableOpacity>
        )
    }
}

export default {
    get(navigation, nextScreen, onBack, onNext) {
        return {
            headerStyle: {
                elevation: 0,
            },
            headerLeft: <GoBack onPress={onBack} navigation={navigation} />,
            headerRight: <GoForward onPress={onNext} navigation={navigation} nextScreen={nextScreen} />,
        };
    },
    getNoBack(navigation, nextScreen, onNext) {
        return {
            headerStyle: {
                elevation: 0,
            },
            headerLeft: (
                <View></View>
            ),
            headerRight: <GoForward onPress={onNext} navigation={navigation} nextScreen={nextScreen}  />,
        };
    }
}
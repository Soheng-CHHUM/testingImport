import React, { Component } from 'react';
import {
    View, Text, ScrollView, TouchableHighlight,
    Image, TouchableOpacity
} from 'react-native';
import styles from './Styles/MapScreenStyle'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Images } from '../Themes'
import MessageList from '../Components/MessageList'


class ChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <MessageList
                recordsSource='Tous'
                user={{
                    nbKmLimitZone: 40,
                    Key: '-LaGbltJkrVT-c-xqhUq',
                    Name: 'Kevin',
                    status: 'online'
                }}
                />
        );
    }
}

export default ChatScreen;
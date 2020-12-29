import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text } from 'react-native'
import styles from './Styles/NotificationCounterStyle'

export default class NotificationCounter extends Component {
  // // Prop type warnings
  static propTypes = {
    nbUnreadMessages: PropTypes.number.isRequired
  }

  render () {
    return (
      <View style={styles.container}>
        {
          this.props.nbUnreadMessages && this.props.nbUnreadMessages > 0 &&
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationMessage}>{this.props.nbUnreadMessages}</Text>
            </View>
        }
      </View>
    )
  }
}

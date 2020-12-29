import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native'
import styles from './Styles/DoneButtonStyle'
import {ApplicationStyles, Colors} from '../Themes'

import Translator from '../Translations/Translator'

import LinearGradient from 'react-native-linear-gradient';

export default class DoneButton extends Component {
  
  static propTypes = {
    onPress: PropTypes.func.isRequired
  }
  
  render () {
    return (
      <LinearGradient
          start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
          locations={[0, 0.6]}
          colors={Colors.gradientLow}
          style={ApplicationStyles.button}>
          <TouchableOpacity
              style={ApplicationStyles.linearGradiantButton}
              onPress={() => this.props.onPress()}>
              <Text style={styles.text}>{Translator.t('common.done')}</Text>
          </TouchableOpacity>
      </LinearGradient>
    )
  }
}

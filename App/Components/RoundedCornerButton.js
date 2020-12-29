import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text , TouchableOpacity} from 'react-native'
import styles from './Styles/RoundedCornerButtonStyle'
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Metrics} from '../Themes'

export default class RoundedCornerButton extends Component {
  // // Prop type warnings
  static propTypes = {
    containerStyle: PropTypes.object,
    buttonStyle: PropTypes.object,
    onPress: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    textColor: PropTypes.string,
    gradient: PropTypes.array
  }
  
  static defaultProps = {
    gradient: Colors.gradientMainColorsSmooth,
    textColor: Colors.white
  }

  constructor(props) {
    super(props)

    this.state = {
      containerStyle: props.containerStyle ? props.containerStyle : {width: Metrics.buttons.medium, height: Metrics.buttons.medium},
      buttonStyle: props.buttonStyle ? props.buttonStyle : {},
      textColor: props.textColor,
      text: props.text,
      gradient: props.gradient
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      containerStyle: props.containerStyle ? props.containerStyle : this.state.containerStyle,
      buttonStyle: props.buttonStyle ? props.buttonStyle : this.state.buttonStyle,
      textColor: props.textColor ? props.textColor : this.state.textColor,
      text: props.text ? props.text : this.state.text,
      gradient: props.gradient ? props.gradient : this.state.gradient
    })
  }

  render () {

    const ButtonText = () => <Text style={[styles.buttonText, {color: this.state.textColor}]}>{this.state.text}</Text>

    return (
      <View style={[styles.container, this.state.containerStyle]}>
        <TouchableOpacity
          style={styles.btnConfirmStyle}
          onPress={() => this.props.onPress()}
        >
          {
            this.state.gradient.length <= 1 ? 
            <View style={[styles.linearGradient, this.state.buttonStyle]}>
              <ButtonText />
            </View>
            :
            <LinearGradient
              locations={[0,0.2,1]}
              start={{x: 1, y: 1}} end={{x: 0, y: 0}}
              colors={this.state.gradient}
              style={[styles.linearGradient, this.state.buttonStyle]}>
              <ButtonText />
            </LinearGradient>
          }
        </TouchableOpacity>
      </View>
    )
  }
}

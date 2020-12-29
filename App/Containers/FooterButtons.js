import React, { Component } from 'react'
import { Alert, View, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types';
import ChatButton from '../Components/ChatButton'
import ProfileButton from '../Components/ProfileButton'
import RecordButton from '../Components/RecordButton'

import Svg, { Path } from 'react-native-svg';

import Metrics from '../Themes/Metrics'

// Styles
import styles from './Styles/FooterButtonsStyle'

export default class FooterButtons extends Component {

 

  constructor(props) {
    super(props)
    this.state = {
      user: props.user,
      recordsSource: props.recordsSource
    }
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    recordsSource: PropTypes.string,
    handleEditProfile: PropTypes.func.isRequired,
    handleInviteContact: PropTypes.func.isRequired,
    currentLocation: PropTypes.object,
    on_press_title: PropTypes.string,
    chatroom: PropTypes.object,
  }

  componentWillReceiveProps(props) {
    if (props.user && props.user != this.state.user) this.setState({ user: props.user })
    if(props.recordsSource != this.state.recordsSource) this.setState({recordsSource: props.recordsSource})
  }

  render() {
    const distBtwTopAndMidButton = 25
    const CURVE_CIRCLE_RADIUS = 40
    const startY = 30
    const navBarHeight = Metrics.buttons.large + distBtwTopAndMidButton

    // the coordinates (x,y) of the start point before curve
    const firstCurveStartPoint = { x: Math.round((Metrics.screenWidth / 2) - (CURVE_CIRCLE_RADIUS * 2) - (CURVE_CIRCLE_RADIUS / 3)), y: startY }

    // the coordinates (x,y) of the end point after curve
    const firstCurveEndPoint = { x: Math.round(Metrics.screenWidth / 2), y: 1 }

    // same thing for the second curve
    const secondCurveStartPoint = firstCurveEndPoint;
    const secondCurveEndPoint = { x: Math.round((Metrics.screenWidth / 2) + (CURVE_CIRCLE_RADIUS * 2) + (CURVE_CIRCLE_RADIUS / 3)), y: startY }

    // the coordinates (x,y)  of the 1st control point on a cubic curve
    const firstCurveControlPoint1 = { x: Math.round(firstCurveStartPoint.x + CURVE_CIRCLE_RADIUS + (CURVE_CIRCLE_RADIUS / 4)), y: firstCurveStartPoint.y }

    // the coordinates (x,y)  of the 2nd control point on a cubic curve
    const firstCurveControlPoint2 = {x: Math.round( firstCurveEndPoint.x - (CURVE_CIRCLE_RADIUS * 2) + CURVE_CIRCLE_RADIUS ), y: firstCurveEndPoint.y }

    const secondCurveControlPoint1 = {x: Math.round( secondCurveStartPoint.x + (CURVE_CIRCLE_RADIUS * 2) - CURVE_CIRCLE_RADIUS ), y: secondCurveStartPoint.y }
    const secondCurveControlPoint2 = {x: Math.round( secondCurveEndPoint.x - (CURVE_CIRCLE_RADIUS + (CURVE_CIRCLE_RADIUS / 4)) ), y: secondCurveEndPoint.y }

    const SvgComponent = () => (
      <Svg width={Metrics.screenWidth} height={navBarHeight}>
        <Path
          fill="#191919"
          d={
            `M${firstCurveStartPoint.x} ${firstCurveStartPoint.y}
               C${firstCurveControlPoint1.x},${firstCurveControlPoint1.y} ${firstCurveControlPoint2.x}, ${firstCurveControlPoint2.y} ${firstCurveEndPoint.x}, ${firstCurveEndPoint.y}
               C${secondCurveControlPoint1.x}, ${secondCurveControlPoint1.y} ${secondCurveControlPoint2.x}, ${secondCurveControlPoint2.y} ${secondCurveEndPoint.x}, ${secondCurveEndPoint.y}
               L${Metrics.screenWidth}, ${startY}
               L${Metrics.screenWidth}, ${navBarHeight}
               L0, ${navBarHeight}
               L0, ${startY}`
          }
        />
      </Svg>
    )

    return (
      <View style={styles.container} hitSlop={{top: -startY, bottom: 0, left: 0, right: 0, zIndex: 999}}>
        <SvgComponent />
        <ChatButton user={this.state.user} chatroom={this.props.chatroom} on_press_title={this.props.on_press_title}/>
        <RecordButton
          width={Metrics.buttons.large}
          height={Metrics.buttons.large}
          isRecordDeviceFree={true}
          recordsSource={this.state.recordsSource}
          currentLocation={this.props.currentLocation}
          user={this.state.user} />
        <ProfileButton onPressEditProfile={this.props.handleEditProfile} onPressInviteContact={this.props.handleInviteContact}/>
      </View>
    )
  }
}

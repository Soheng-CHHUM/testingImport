import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity } from 'react-native'
import styles from './Styles/UserPictureStyle'
import { ApplicationStyles, Colors, Metrics } from '../Themes'
import UserService from '../Services/User'

export default class UserPicture extends Component {
  // // Prop type warnings
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    style: PropTypes.object,
    user: PropTypes.object.isRequired,
    appUser: PropTypes.object,
    //status: PropTypes.string,
    //avatar: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      status: props.user ? props.user.status : null,
      avatar: props.user ? props.user.Avatar : null,
      user: props.user,
      width: props.width ? props.width : 50,
      height: props.height ? props.height : 50,
      radius: props.radius ? props.radius : this.calcRadius(props.width, props.height),
      style: props.style ? props.style : {}
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      status: nextProps.user ? nextProps.user.status : null,
      avatar: nextProps.user ?
        nextProps.user.avatar ? nextProps.user.avatar : nextProps.user.Avatar
        : null,
      user: nextProps.user,
      width: nextProps.width ? nextProps.width : this.state.width,
      height: nextProps.height ? nextProps.height : this.state.height,
      radius: nextProps.radius ? nextProps.radius : this.state.radius,
      style: nextProps.style ? nextProps.style : {}
    });
  }

  calcRadius(width, height) {
    let radius = width && height && width > height ? width : height

    if (!radius) radius = width ? width : height ? height : 50

    return radius / 2
  }

  onPress() {
    if (global.currentScene == "FindGroupScreen") {
    }
    else {
      if (this.props.onPress) this.props.onPress(this.props.user)
    }
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.container, this.state.style]}
        onPress={() => this.onPress()}>

        <TouchableOpacity onPress={() => this.onPress()} style={[styles.avatar, {
          height: this.state.height + 1,
          width: this.state.width + 1
        }]}>
          {
            this.state.status ?
              <View style={[ApplicationStyles.circle,
              { backgroundColor: UserService.getStatusColor(this.state.status), borderWidth: 2, borderColor: Colors.white }]}></View>
              : null
          }

          {
            this.state.avatar ?
              <View style={{
                margin: 1,
                height: this.state.height,
                width: this.state.width,
                borderRadius: this.state.radius,
                borderWidth: 1,
                overflow: 'hidden',
                borderColor: 'transparent'
              }}>

                <Image placeholderColor={'#afafaf'}
                  style={[ApplicationStyles.radioAvatar, {
                    borderRadius: this.state.radius,
                    borderWidth: 1,
                    width: this.state.width,
                    height: this.state.height
                  }]}
                  resizeMode="contain"
                  source={{ uri: this.state.avatar }} />
              </View> : null
          }
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}

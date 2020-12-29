import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text } from 'react-native'
import styles from './Styles/GroupPictureStyle'
import UserPictureComponent from './UserPicture'
import Metrics from '../Themes/Metrics'

export default class GroupPicture extends Component {
  // // Prop type warnings
  static propTypes = {
    groupPic: PropTypes.string,
    groupStatus: PropTypes.string,
    groupPicWidth: PropTypes.number,
    groupPicHeight: PropTypes.number,
    userPic: PropTypes.string,
    userStatus: PropTypes.string,
    onPress: PropTypes.func.isRequired
  }

  static defaultProps = {
    groupPicWidth: Metrics.icons.medium,
    groupPicHeight: Metrics.icons.medium,
  }

  render () {
    return (
      <View style={[styles.container,{backgroundColor:'white'}]}>
        <UserPictureComponent
            onPress={() => null}
            usePopUp={false}
            user={{
              Avatar: this.props.groupPic,
              status: this.props.groupStatus
            }}
            radius={10}
            width={this.props.groupPicWidth}
            height={this.props.groupPicHeight}
            style={{
                marginLeft: 0,
                padding: 0
            }} />

        <UserPictureComponent
          onPress={() => null}
          usePopUp={false}
          user={{
            Avatar: this.props.userPic,
            status: this.props.userStatus
          }}
          radius={10}
          width={Metrics.icons.medium}
          height={Metrics.icons.medium}
          style={{position: 'absolute',
              top: -Metrics.icons.medium/3, left: Metrics.icons.medium/2}}/>
      </View>
    )
  }
}

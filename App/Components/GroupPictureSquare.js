import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text } from 'react-native'
import styles from './Styles/GroupPictureSquareStyles'
import GroupPicture from './GroupPicture'
import Metrics from '../Themes/Metrics'

export default class GroupPictureSquare extends Component {
  // // Prop type warnings
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render () {
    const { item } = this.props
    
    return (
        <View style={styles.container}>
        {
            item.picture && item.picture != '' ? 
            <GroupPicture groupPicWidth={styles.container.width} groupPicHeight={styles.container.height} groupPic={item.picture} groupStatus={item.status} />
            :
            <View style={styles.containerNoPicture}>
                <Text style={styles.text}>G</Text>
            </View>
        }
        </View>
    )
  }
}

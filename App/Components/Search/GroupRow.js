
import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native'
import styles from '../Styles/SearchListStyle'
import ApplicationStyles from '../../Themes/ApplicationStyles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import GroupPictureSquare from '../GroupPictureSquare'

class GroupRow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      item: props.item,
      index: props.index,
      isSelected: props.isSelected,
      onPress: props.onPress
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      item: props.item ? props.item : this.state.item,
      index: props.index,
      isSelected: props.isSelected,
      onPress: props.onPress
    })
  }

  render() {
    const { item, index, isSelected, onPress } = this.state
    return <TouchableOpacity key={`View_${index}`} onPress={() => onPress ? onPress(item) : null} style={styles.listItemContainer}>
      <View key={`View_Top_${index}`} style={styles.listItem}>
        <View style={[styles.firstColumn]}>
          <GroupPictureSquare item={item} />
        </View>
        <View style={styles.secondColumn}>
          <Text key={`Text${index}_${item.name}`} style={styles.listItemText}>{item.name}</Text>
        </View>
        <View>
          {
            isSelected && item.isPublic ?
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text key={`Text${index}_3_${item.name}`} style={[styles.listItemText,{ color: '#B360D2' }]}>Inscrit</Text>
                <FontAwesome name='lock' size={16} />
              </View>
              :
              isSelected ?
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Text key={`Text${index}_3_${item.name}`} style={styles.listItemText}>En attente</Text>
                  <FontAwesome name='lock' size={16} />
                </View>
                : item.isPublic ?
                  <Text key={`Text${index}_3_${item.name}`} style={[styles.listItemText, { color: '#B360D2' }]}>Public</Text>
                  :
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text key={`Text${index}_3_${item.name}`} style={styles.listItemText}>Privé</Text>
                    <FontAwesome name='lock' size={16} />
                  </View>
          }
        </View>
      </View>
    </TouchableOpacity>
  }
}

export default {
  component: GroupRow,
  title: 'Groupes',
  path: 'groups',
  key: 'groupNameToLower',
  filter: (curUserKey, snapshot, callback) => {
    var groups = [];

    snapshot.forEach((childSnapshot) => {
      if (!childSnapshot.val() || !childSnapshot.val().name) return
      groups.push({ ...childSnapshot.val(), key: childSnapshot.key });
    });
    return callback(groups)
  }
}

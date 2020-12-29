
import React, { Component } from 'react'

import {
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    Image,
    FlatList
} from 'react-native'

import Colors from '../../Themes/Colors'

import { SkypeIndicator } from 'react-native-indicators'

import FirebaseService from '../../Services/Firebase'
import Translator from '../../Translations/Translator'
import GroupPictureSquare from '../GroupPictureSquare'

import styles from '../Styles/SearchListStyle'
import ApplicationStyles from '../../Themes/ApplicationStyles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

class TagRow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            item: props.item,
            index: props.index,
            onPress: props.onPress,
            displayGroups: false,
            isItemSelected: props.isItemSelected,
            refreshState: false,
            isLoadingGroups: false,
            groups: []
        }
    }

    componentWillReceiveProps(props) {
        this.setState({
            item: props.item ? props.item : this.state.item,
            index: props.index,
            isItemSelected: props.isItemSelected,
            onPress: props.onPress
        })
    }

    onPress = () => {

        if (this.state.displayGroups) return this.setState({ displayGroups: false })

        if (this.state.groups.length > 0) return this.setState({ displayGroups: !this.state.displayGroups })

        if(this.state.isLoadingGroups) return

        this.loadGroups()
    }

    onPressItem = (item) => {

        if(this.props.onPress) this.props.onPress(item)

        const groups = this.state.groups.map((grp) => {
            if(grp.key != item.key) return grp

            return {
                ...grp,
                isSelected: !grp.isSelected
            }
        })

        this.setState({groups})
    }

    loadGroups() {
        this.setState({ isLoadingGroups: true })

        let query = FirebaseService.database()
                        .ref(`/tags/references/${this.state.item.key}`)

        if(this.state.groups.length > 0) query = query.startAt(this.state.groups[this.state.groups.length-1].key)

        query.orderByKey()
            .limitToFirst(5)
            .once('value', items => {
                if (!items.exists()) return this.setState({ isLoadingGroups: false })

                let groups = this.state.groups

                items.forEach((item) => {
                    if(groups.find(grp => grp.key == item.key)) return
                    groups.push({ ...item.val(), key: item.key })
                })

                console.log('load items', items)
                this.setState({ groups, displayGroups: true, isLoadingGroups: false })
            })
    }

    loadMoreGroups() {
        this.loadGroups()
    }

    renderGroupRow = ( item, index ) => {
        return <View key={`ViewContainer_Group_${index}`} style={styles.listItemContainer}>
            <TouchableOpacity key={`View_Group_${index}`} onPress={() => this.onPressItem(item)} style={styles.listItemContainer}>
                <View key={`View_Top_Group_${index}`} style={styles.listItem}>
                    <View style={styles.firstColumn}>
                        <GroupPictureSquare item={item} />
                    </View>
                    <View style={styles.secondColumn}>
                        <Text key={`Text${index}_${item.name}`} style={styles.listItemText}>{item.name}</Text>
                    </View>
                    <View>
                        {
                            this.props.isItemSelected && this.props.isItemSelected(item)
                            ?
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text key={`Text${index}_3_${item.name}`} style={styles.listItemText}>En attente</Text>
                                <FontAwesome name='lock' size={16} />
                            </View>
                            :
                            (
                                item.isPublic ?
                                <Text key={`Text${index}_3_${item.name}`} style={[styles.listItemText, { color: '#B360D2' }]}>Public</Text>
                                :
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text key={`Text${index}_3_${item.name}`} style={styles.listItemText}>Privé</Text>
                                    <FontAwesome name='lock' size={16} />
                                </View>
                            )
                        }
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    }

    renderGroupsRows = () => {

        return <View style={{flex: 1}}>
            <View style={{backgroundColor: '#C8C8D0',height: 1}}/>
            <FlatList
                keyExtractor={(item) => item.key}
                style={{zIndex: 10000}}
                scrollEnabled={true}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 5 }}
                maxHeight={styles.listItemContainer.height * 3}
                data={this.state.groups}
                renderItem={({ item, index }) => this.renderGroupRow(item, index)}
                onEndReachedThreshold={0.5}
                refreshing={this.state.isLoadingGroups}
                onEndReached={() => this.loadMoreGroups()}
            />
            <View style={{backgroundColor: '#C8C8D0',height: 1}}/>
        </View>
    }

    renderTagRow = () => {
        const { item, index } = this.state

        return <View key={`View_${index}`}  style={{ justifyContent: 'space-between', flexDirection: 'row', margin: 16 }}>
            <TouchableOpacity key={`TouchableOpacity_Group_${index}`} onPress={() => this.onPress()} style={styles.listItemContainer}>
                <View >
                    <Text style={styles.textTag}>{item.content}</Text>
                </View>
                <View >
                    <Text>
                        {
                            item.usedNbTimes + ' ' + Translator.t('common.result', { count: item.usedNbTimes })
                        }
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    }

    render() {
        return <View style={{flex: 1}}>
            {
                this.renderTagRow()
            }

            {
                this.state.displayGroups && this.renderGroupsRows()
            }

            {
                this.state.isLoadingGroups ?
                    <View style={styles.containerSearchIcon}>
                        <SkypeIndicator color={Colors.mainColor} size={26} style={{ alignSelf: 'center' }} />
                    </View>
                : null
            }
        </View>
    }
}

export default {
    component: TagRow,
    title: 'Tags',
    path: 'tags',
    key: 'content',
    filter: (curUserKey, snapshot, callback) => {
        var tags = [];

        snapshot.forEach((childSnapshot) => {
            if(!childSnapshot.val() || !childSnapshot.val().content) return

            tags.push({ ...childSnapshot.val(), key: childSnapshot.key });
        });

        return callback(tags)
    }
}

import React, { Component } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, StyleSheet
} from 'react-native';

import UserService from '../Services/User'
import Searcher from '../Components/Search/SearchList'
import GroupRow from '../Components/Search/GroupRow'
import TagRow from '../Components/Search/TagRow'
import UserRow from '../Components/Search/UserRow'

import {connect} from 'react-redux'

var invitedFriends = {}

var searchables = [
    {
        useOnPressCallback: true,
        onPress: (item, navigation, user, callback) => {
            navigation.navigate("PrivateGroupScreen", {item: item, callback})
        },
        element: GroupRow
    },
    {
        useOnPressCallback: true,
        onPress: (item, navigation, user, callback) => navigation.navigate("PrivateGroupScreen", {item: item, callback}),
        element: TagRow
    },
    {
        onPress: (item, navigation, user) => {

            if(invitedFriends[item.key]) return
            invitedFriends[item.key] = true

            UserService.sendFriendRequests(user.Key, [item], () => {})
        },
        element: UserRow
    },
]

class SearchScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTabIndex: 0,
        }
    }

    handleOpenPrivateGroupScreen = (item)=>{
        this.props.navigation.navigate("PrivateGroupScreen", {item: item});
    }

    onPressItem(item, callback) {
        searchables[this.state.selectedTabIndex ].onPress(item, this.props.navigation, this.props.user, callback)
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Searcher
                rollbackState={false}
                useOnPressCallback={index => searchables[index] && searchables[index].useOnPressCallback}
                searchables={searchables.map(item => item.element)}
                onPressTab={(index) => this.setState({selectedTabIndex: index})}
                onPressPrivateScreen={(item)=>this.handleOpenPrivateGroupScreen(item)}
                user={this.props.user}
                onPress={(item, index, callback) => this.onPressItem(item, callback)}
                onPressCancel={()=>{this.props.navigation.goBack();}}/>
            </View>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.auth.user
    }
  }

  export default connect(mapStateToProps, null)(SearchScreen)

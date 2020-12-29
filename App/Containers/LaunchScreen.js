import React, { Component } from 'react'
import { ScrollView, Text, Image, View, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { Images } from '../Themes'
import Firebase from '../Services/Firebase'
import UserService from '../Services/User'
import GeoService, { USERS } from '../Services/GeoService'
import GroupService from '../Services/GroupService'

import ThreadList from '../Components/ThreadList'
import Searcher from '../Components/Search/SearchList'
import AuthActions from '../Redux/AuthRedux'

import FooterButtons from './FooterButtons'
import PhoneToIndex from '../Transforms/PhoneToIndex'

// Styles
import styles from './Styles/LaunchScreenStyles'
import Group from '../Models/Group';
import Chatroom from '../Models/Chatroom'

class LaunchScreen extends Component {

  constructor(props) {
    super(props)

    this.state = { users: [], curUser: null }
  }

  componentDidMount() {
    this.authenticateTestUser()
  }

  authenticateTestUser() {
    UserService.loginWithEmailPassword('superuser@bi-kay.com', '123456', (user, error) => {
      if (!user) return

      this.props.setUser(user)

      this.setState({ curUser: user })

      this.props.navigation.navigate('MapScreen')
    })
  }

  mapScreen = () => {
    this.props.navigation.navigate('HomeScreens')
  }
  render() {

    return (
      <View style={styles.mainContainer}>


        <TouchableOpacity
          onPress={this.mapScreen}
          style={{ backgroundColor: 'green', zIndex: 1, margin: 20, width: 120, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 20, color: 'white', padding: 10 }}>Start Now</Text>
        </TouchableOpacity>

        <Image source={Images.background} style={styles.backgroundImage} resizeMode='stretch' />

        <ScrollView style={styles.container}>

          <View style={styles.centered}>
            <Image source={Images.launch} style={styles.logo} />
          </View>

          <FooterButtons user={this.state.curUser} />

          <Searcher user={this.state.curUser} />

          <View style={styles.section} >
            <Image source={Images.ready} />

            {
              this.state.curUser &&
              <ThreadList
                user={this.state.curUser}
                onPress={(user, chatroom) => {
                  if (this.isCancelled) return;

                  //UserService.reloadThread(chatroom.key);

                  //this.setState({selectedChatUser: user, chatroom, selectedThread: chatroom.key})
                }} />
            }


            {
              this.state.users.map((user, index) =>
                <Text key={'Text_' + index} style={styles.sectionText}>#{user.Name}</Text>
              )
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    loaded: state.appState.rehydrationComplete
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => dispatch(AuthActions.authSetUser(user)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)

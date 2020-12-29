import React, { Component } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { connect } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler';
import AppConfig from '../Config/AppConfig';
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
import Translator from '../Translations/Translator'
import SearchList from '../Components/Search/SearchList'
import ContactRow, {refreshContactsList, refreshFriendsList} from '../Components/Search/ContactRow'
import PassHeader from '../Components/Headers/PassHeader'
import DoneButton from '../Components/DoneButton'
import ShareService from '../Services/ShareService'

// Styles
import styles from './Styles/FindContactsScreenStyle'

const NEXT_SCREEN_NAME = 'FindGroupScreen'

class FindContactsScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: props.user,
      contacts: []
    }
    global.currentScene = "FindContactsScreen";

  }

  static navigationOptions = ({ navigation }) =>
    PassHeader.get(navigation, 'FindGroupScreen', () => {
      refreshFriendsList((contacts) => this.setState({contacts}))
    })

  componentDidMount() {
    refreshContactsList((contacts) => this.setState({contacts}))
  }

  componentWillReceiveProps(props) {
    if(global.currentScene=="FindContactsScreen"){
      if(props.user && props.user != this.state.user) this.setState({user: props.user})
    }
  }

  goNext() {
    return this.props.navigation.navigate(NEXT_SCREEN_NAME)
  }

  onPressDone() {
    const recipients = this._searchComponent.getSelectedItems().map((user) => user.Phone)
    if(!recipients.length) return this.goNext()

    const {navigation} = this.props

    ShareService.shareAppBySms(this.state.user.Key, recipients, (completed, cancelled, error) => {
      return this.goNext()
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.listContainer}>
          <View style={styles.pageContainer}>
            <View style={styles.innerContainer}>
              <Text style={styles.titleText}>{Translator.t('find_contacts.title')}</Text>
              <Text style={styles.paragraph}>{Translator.t('find_contacts.subtitle', {
                app_name: AppConfig.appName
              })}</Text>
            </View>
            <SearchList
              onPressCancel={() => this.goNext()}
              ref={component => this._searchComponent = component}
              user={this.state.user}
              searchables={[ContactRow]} />
          </View>
      </ScrollView>
      <View style={styles.doneButtonContainer}>
        <DoneButton onPress={() => this.onPressDone()} />
      </View>
    </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FindContactsScreen)

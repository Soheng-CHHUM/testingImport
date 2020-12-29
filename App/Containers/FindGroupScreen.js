import React, { Component } from 'react'
import { ScrollView, Text, View,TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
import Translator from '../Translations/Translator'
import SearchList from '../Components/Search/SearchList'
import GroupRow from '../Components/Search/GroupRow'
import TagRow from '../Components/Search/TagRow'
import AppConfig from '../Config/AppConfig'
import PassHeader from '../Components/Headers/PassHeader'
import GroupService from '../Services/GroupService'
import { Icon } from 'native-base';

// Styles
import styles from './Styles/FindGroupScreenStyle'

import DoneButton from '../Components/DoneButton'

const NEXT_SCREEN_NAME = 'ShareOption'

class FindGroupScreen extends Component {

  constructor (props) {
    super(props)
    this.state = {
      user: props.user
    }
    global.currentScene = "FindGroupScreen";

  }

  static navigationOptions = ({ navigation }) => PassHeader.get(navigation, NEXT_SCREEN_NAME)

  goNext() {
    return this.props.navigation.navigate(NEXT_SCREEN_NAME)
  }

  onPressDone() {
    // const groups = this._searchComponent.getSelectedItems()
    // groups.map(grp => {
    //   GroupService.subscribe(this.state.user.Key, grp.key)
    // })

    return this.goNext()
  }

  render () {
    return (
      <View style={[styles.container],{paddingBottom:30}}>
          <ScrollView style={styles.listContainer}>
          <View style={[styles.pageContainer],{marginBottom:80}}>
            <View style={[styles.innerContainer],{paddingLeft:13}}>
              <Text style={styles.titleText}>{Translator.t('find_group.title')}</Text>
              <Text style={styles.paragraph}>{Translator.t('find_group.subtitle', {
                app_name: AppConfig.appName
              })}</Text>
            </View>
            <SearchList
              onPressCancel={() => this.goNext()}
              ref={component => this._searchComponent = component}
              user={this.state.user}
              searchables={[GroupRow, TagRow]} />
          </View>

        </ScrollView>

        <View style={[styles.doneButtonContainer],{marginTop:40}}>
          <DoneButton onPress={() => this.onPressDone()} />
        </View>
        {/* <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#B360D2' }}>
          <TouchableOpacity onPress={this.openShareOption} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, paddingLeft: 10, paddingRight: 10 }}>
            <View><Text style={{ fontSize: 17, fontWeight: 'bold', color: 'white' }}>Inviter des amis</Text></View>
            <View><Icon name='right' type="AntDesign" style={{ fontSize: 20, color: 'white' }} /></View>
          </TouchableOpacity>
        </View> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(FindGroupScreen)

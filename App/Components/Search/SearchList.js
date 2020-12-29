import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from "lodash"
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native';
import { SkypeIndicator } from 'react-native-indicators'

import Icon from 'react-native-vector-icons/MaterialIcons'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import Colors from '../../Themes/Colors'
import FirebaseService from '../../Services/Firebase'
import Searcher from '../../Services/Searcher'
import styles from '../Styles/SearchListStyle'

import UserRow from './UserRow'
import GroupRow from './GroupRow'
import TagRow from './TagRow'
import UserService from '../../Services/User'
import { ScrollView } from 'react-native-gesture-handler';
import UserPopUp from '../UserPopUp'
import GroupService from '../../Services/GroupService'

var searchables = [
  GroupRow,
  TagRow,
  UserRow,
]

export default class SearchList extends Component {

  state = {
    selectedUser: null,
    data: [],
    otherData: [],
    source: 0,
    text: '',
    selectedItems: [],
    isSearching: false,
    isPopUpVisible: false
  }

  static propTypes = {
    rollbackState: PropTypes.bool,
    user: PropTypes.object.isRequired,
    searchables: PropTypes.array,
    isItemSelected: PropTypes.func,
    onPressTab: PropTypes.func,
    onPressItem: PropTypes.func,
    onPressSpecial: PropTypes.func,
    onPressCancel: PropTypes.func,
    onPressPrivateScreen: PropTypes.func
  }

  static defaultProps = {
    onPressItem: () => { },
    onPressCancel: () => { },
    rollbackState: true
  }

  constructor(props) {
    super(props)
    this.arrayKeyOfGroupe = []
    this.keyResult = []
    if (props.searchables) searchables = props.searchables
    this.state.isSearching = props.isSearching ? props.isSearching : false
  }


  componentDidMount() {
    if (this.getElement().displayAllWhenEmpty) this.startSearch('')
  }
  componentWillMount = () => {
    this.startSearch('')
  }
  clearText = () => {
    this._input.clear()
    this.setState({ data: [], otherData: [], text: '', isSearching: false });
  }

  getElement = () => {
    return searchables[this.state.source]
  }

  isElementInSearch(element) {
    return element.title == searchables[this.state.source].title
  }

  searchOtherData = (element, data, text) => {
    element.deeperSearch(this.props.user, text, (otherData) => {
      if (this.state.text != text) return
      if (!this.isElementInSearch(element)) return

      this.setState({ data, otherData, isSearching: false })
    })
  }

  startSearch = (text) => {
    // if (text == null || !this.props.user) return this.setState({ data: [], text: '', isSearching: false });

    let element = this.getElement()

    // if(text.trim() == '' && !element.displayAllWhenEmpty) return this.setState({ data: [], text: '', isSearching: false });

    text = text.trim().toLowerCase();

    this.setState({ text, isSearching: true }, () => {
      if (element.search) {
        return element.search(text, (data) => {

          if (!this.isElementInSearch(element)) return

          if (element.deeperSearch) this.searchOtherData(element, data, text)
          else this.setState({ data, isSearching: false })
        })
      }

      Searcher.searchQuery(element.path, element.key, text, this.props.user.Key, (snapshot) => {
        if (!this.isElementInSearch(element)) return
        if (this.state.text != text) return
        if (this.props.user) {
          element.filter(this.props.user.Key, snapshot, (data) => {

            if (element.deeperSearch) element.deeperSearch(this.props.user, text, (otherData) => this.setState({ data, isSearching: false, otherData }))
            else this.setState({ data, isSearching: false })
          })
        }
      }, () => {
        this.setState({ data: [], otherData: [], isSearching: false });
      });
    })
  }

  getSelectedItems = () => {
    return this.state.selectedItems
  }

  isItemSelected = (item, index) => {
    if (this.props.isItemSelected) return this.props.isItemSelected(item, index)
    return this.state.selectedItems.find((elt) => elt.key == item.key) != null
  }

  onPressSpecial = () => {
    if (this.props.onPressSpecial) this.props.onPressSpecial()

    const selectedItems = this.state.data.map((elt, index) => {
      return {
        ...elt,
        index
      }
    })

    this.setState({ selectedItems })
  }

  onPressTab = (index) => {

    if (this.props.onPressTab) this.props.onPressTab(index)

    Searcher.off()

    this.setState({ data: [], source: index })
    setTimeout(() => {
      this.startSearch('')
    }, 1000);
  }

  onPress = (item, index) => {
    if (index == "index_of_request_fri_to_join") {
      this.setState({ selectedUser: item, isPopUpVisible: true })
      return true;
    } else {
      if (this.keyResult.some(key => key.groupkey === item.key) && global.currentScene == "FindGroupScreen") {
        return true;
      }
      else {
        if (global.currentScene == "FindGroupScreen") {
          userKey = []
          userKey.push(this.props.user.Key)
          const groupKey = item.key
          const statusGroup = item.isPublic
          if (this.props.callback) {
            this.props.callback(true)
          }
          if (statusGroup) {
            uniqueKeyUsers = _.uniq([...item.users, ...userKey])
            let groupData = {
              users: uniqueKeyUsers
            }
            GroupService.filterGroupInChatroom(groupKey);
            GroupService.updateGroup(groupKey, groupData);
          }
          else {
            GroupService.subscribe(userKey, groupKey);
          }
        }

        this.arrayKeyOfGroupe.push({ groupkey: item.key })
        this.keyResult = _.uniqBy(this.arrayKeyOfGroupe, 'groupkey');
        const onPressItem = (isItemSelected) => {
          if (!isItemSelected) return
          let items = this.state.selectedItems

          item.index = index

          if (this.isItemSelected(item, index) && this.props.rollbackState) items = this.state.selectedItems.filter((elt) => elt.key != item.key)
          else items.push(item)
          this.setState({ selectedItems: items })
        }
        if (this.props.useOnPressCallback && this.props.useOnPressCallback(this.state.source) && this.props.onPress)
          return this.props.onPress(item, index, isItemSelected => onPressItem(isItemSelected))
        else if (this.props.onPress) this.props.onPress(item, index)
        return onPressItem(true)
      }
    }

  }

  renderRow = (item, index) => {
    let Element = this.getElement().component
    return <Element
      item={item}
      otherItemData={this.state.otherData}
      index={index}
      isSelected={this.isItemSelected(item, index)}
      isItemSelected={(item) => this.isItemSelected(item)}
      onPress={(item, index) => this.onPress(item, index)} />
  }
  renderNbElementsBloc = () => {
    const nbData = (this.getElement().countAll && this.state.text.trim() == '') ?
      this.getElement().countAll() : this.state.data.length

    const resultTxt = this.getElement().resultsText ? this.getElement().resultsText(nbData) : null

    return (
      <View style={styles.nbResultsContainer}>
        <Text style={styles.countText}> {nbData} {resultTxt}</Text>
        {
          this.getElement().specialBloc ? this.getElement().specialBloc(() => this.onPressSpecial()) : null
        }
      </View>
    )
  }

  render() {
    const curIndex = this.state.source
    return (
      <View style={styles.container}>
        <View style={styles.containerTop}>
          <View style={[styles.searchBar,{width:global.currentScene == "FindFriendsScreen" ? '95%' :'75%'}]}>
            <View style={styles.searchIcon}>
              <Icon
                name="search"
                size={26}
                color="#C8C7CD"
              />
            </View>
            <View style={styles.searchInputContainer}>
              <TextInput style={styles.searchInput}
                ref={(input) => this._input = input}
                // placeholder={global.searchFromScreen=="MapScreen"?"Rechercher autour de vous":'Rechercher autour de vous'}
                placeholder={'Rechercher autour de vous'}
                autoCapitalize='none'
                selectionColor={Colors.mainColor}
                onChangeText={(text) => this.startSearch(text)} />
            </View>
            <View style={styles.rightIcon}>
              <TouchableOpacity onPress={() => this.clearText()}>
                <Icon
                  name="cancel"
                  size={26}
                  color="#C8C7CD"
                />
              </TouchableOpacity>
            </View>
          </View>
          {global.currentScene == "FindFriendsScreen" ? null :
            <View style={styles.cancelTextContainer}>
              <TouchableOpacity onPress={() => this.props.onPressCancel()}>
                <Text style={[styles.cancelText, { paddingRight: 5, fontSize: 17 }]}>Annuler</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
        {
          searchables.length > 1 &&
          <SegmentedControlTab
            borderRadius={15}
            tabsContainerStyle={styles.containerSearchOptions}
            tabStyle={styles.itemSearchOption}
            activeTabStyle={styles.itemSearchOptionSelected}
            activeTabTextStyle={styles.itemSearchOptionTextSelected}
            tabTextStyle={styles.itemSearchOptionText}
            selectedIndex={curIndex}
            values={searchables.map(item => item.title)}
            onTabPress={(index) => this.onPressTab(index)}
          />
        }

        {
          !this.state.isSearching && this.getElement().displayNbResults &&
          this.renderNbElementsBloc()
        }

        {
          this.state.selectedUser ?
            <UserPopUp
              user={this.state.selectedUser}
              isVisible={this.state.isPopUpVisible}
              onClose={() => this.setState({ isPopUpVisible: false })} />
            : null
        }

        {
          this.state.isSearching ?
            <View style={styles.containerSearchIcon}>
              <SkypeIndicator color={Colors.mainColor} size={26} style={{ alignSelf: 'center' }} />
            </View>
            :
            <View style={styles.searchResults}>
              <ScrollView style={styles.searchBarList}>
                {
                  this.state.data.map((item, index) => this.renderRow(item, index))
                }
              </ScrollView>
            </View>
        }
      </View>
    )
  }
}

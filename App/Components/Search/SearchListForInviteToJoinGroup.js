import React, { Component } from 'react'
import PropTypes from 'prop-types'

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

var searchables = [
  GroupRow,
  TagRow,
  UserRow,
]

export default class SearchListForInviteToJoinGroup extends Component {

  state = { data: [], otherData: [], source: 0, text: '', selectedItems: [], isSearching: false }

  static propTypes = {
    user: PropTypes.object.isRequired,
    searchables: PropTypes.array,
    isItemSelected: PropTypes.func,
    onPressItem: PropTypes.func,
    onPressSpecial: PropTypes.func,
    onPressCancel: PropTypes.func,
    onPressPrivateScreen: PropTypes.func,
    onPressSelectedUsers: PropTypes.func,
  }

  static defaultProps = {
    onPressItem: () => { },
    onPressCancel: () => { }
  }

  constructor(props) {
    super(props)

    if (props.searchables) searchables = props.searchables
  }

  componentDidMount() {
    if (this.getElement().displayAllWhenEmpty) this.startSearch('')
  }

  clearText = () => {
    this._input.clear()
    this.setState({ data: [], otherData: [], text: '', isSearching: false });
  }

  getElement = () => {
    return searchables[this.state.source]
  }

  searchOtherData = (element, data, text) => {
    element.deeperSearch(this.props.user, text, (otherData) => {
      if (this.state.text != text) return
      this.setState({ data, otherData, isSearching: false })
    })
  }

  startSearch = (text) => {
    if (text == null || !this.props.user) return this.setState({ data: [], text: '', isSearching: false });

    let element = this.getElement()

    if (text.trim() == '' && !element.displayAllWhenEmpty) return this.setState({ data: [], text: '', isSearching: false });

    text = text.trim().toLowerCase();

    this.setState({ text, isSearching: true }, () => {

      if (element.search) {
        return element.search(text, (data) => {
          if (element.deeperSearch) this.searchOtherData(element, data, text)
          else this.setState({ data, isSearching: false })
        })
      }

      Searcher.searchQuery(element.path, element.key, text, (snapshot) => {
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

  onPress = (item, index) => {
    // if (this.state.source != 2) {
    //   // this.props.onPressPrivateScreen(item);
    // }
    // else {
    // if (this.props.onPress)
    // this.props.onPress(item, index)
    let items = this.state.selectedItems
    item.index = index
    if (this.isItemSelected(item, index)) items = this.state.selectedItems.filter((elt) => elt.key != item.key)
    else items.push(item)
    this.setState({ selectedItems: items })
    this.props.onPressSelectedUsers(items);
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
          <View style={[styles.searchBar, { flex: 1 }]}>
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
                placeholder=""
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
          {/* <View style={styles.cancelTextContainer}>
            <TouchableOpacity onPress={() => this.props.onPressCancel()}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View> */}
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
            onTabPress={(index) => this.setState({ data: [], source: index })}
          />
        }

        {
          !this.state.isSearching && this.getElement().displayNbResults &&
          this.renderNbElementsBloc()
        }

        {
          this.state.isSearching ?
            <View style={styles.containerSearchIcon}>
              <SkypeIndicator color={Colors.mainColor} size={26} style={{ alignSelf: 'center' }} />
            </View>
            :
            <View style={styles.searchResults}>
              <FlatList
                style={styles.searchBarList}
                data={this.state.data}
                keyExtractor={(item, index) => index.toString() + '_' + this.props.recordsSource}
                ListFooterComponent={() => <View style={{ height: 120 }} />}
                ListHeaderComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item, index }) => this.renderRow(item, index)}
              >
              </FlatList>
            </View>
        }
      </View>
    )
  }
}

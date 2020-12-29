import { Platform, StyleSheet } from 'react-native'
import Colors from '../../Themes/Colors'
import { ApplicationStyles, Metrics, Fonts } from '../../Themes';

export default StyleSheet.create({
  ...ApplicationStyles.search,
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: Colors.white
  },
  containerTop: {
      width: '100%',
      flexDirection: 'row'
  },
  searchBar: {
      width: '75%',
      margin: Metrics.marginHorizontal,
      paddingLeft:5,
      paddingTop:5,
      paddingBottom:5,
      height: 50,
      alignItems: 'center',
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 15,
      borderColor: Colors.veryLightGray,
      backgroundColor: Colors.veryLightGray
  },
  newsearchBar: {
    flex: 1,
    width: '100%',
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
    borderColor: Colors.veryLightGray,
    backgroundColor: Colors.veryLightGray
},
  searchInputContainer: {
      width: '75%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  searchInput: {
      width: '100%',
      height: '100%',
      fontSize: 16,
      paddingTop: 0,
      paddingBottom: 0,
  },
  leftIcon: {
      width: '10%'
  },
  rightIcon: {
      width: '10%',
      marginRight:10
  },
  cancelTextContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  cancelText: {
      color: Colors.mainColor,
      fontSize: 18,
  },
  containerSearchOptions: {
    position: 'relative',
    height: 40,
    flexDirection: 'row',
    backgroundColor: 'rgba(247,247,247,10)',
    borderRadius: 15,
    margin: 10,
  },
  itemSearchOption: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(247,247,247,10)',
    borderColor: 'transparent',
    borderWidth: 1,
  },
  itemSearchOptionSelected: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    height: '100%',
    borderRadius: 15,
    borderColor: 'transparent',
    borderWidth: 1,
    backgroundColor: Colors.black
  },
  itemSearchOptionText: {
    color: Colors.black,
    padding: 0,
    margin: 0,
    alignSelf: 'center',
    fontSize: 16
  },
  itemSearchOptionTextSelected: {
    color: Colors.white,
    padding: 0,
    margin: 0,
    alignSelf: 'center',
    fontSize: 16
  },
  searchBarList: {
      width: '100%',
      paddingHorizontal: 10,
  },
  nbResultsContainer: {
    flex: 1,
    marginBottom: Metrics.marginHorizontal,
    marginHorizontal: Metrics.marginHorizontal,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  countText: {
    ...Fonts.style.description,
    color: Colors.mainColor,
    fontWeight: '400'
  },
  searchResults: {
    flex: 1
  },
  listItemContainer: {
    height: 60,
    width: '100%',
    marginBottom: 2,
    position: 'relative'
  },
  lastColumnContainer: {
    alignItems:'center',
    justifyContent:'center',
    alignContent: 'center',
    flexDirection: 'column'
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    marginTop: 2,
    marginBottom: 2,
  },
  listItemText: {
      color: Colors.black,
      fontSize: 18,
      marginRight: 20
  },
  firstColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flex: 1
  },
  secondColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    flex: 3
  },
  thirdColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60%',
    backgroundColor: 'rgba(179,96,210,10)',
    borderRadius: 10,
    flex: 1
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.mainColor,
    paddingHorizontal: Metrics.marginHorizontal,
    paddingVertical: Metrics.smallMargin,
    borderRadius: 10,
    alignSelf: 'flex-end'
  },
  border: {
      height: 2,
      position: 'absolute',
      bottom: 3,
      backgroundColor: Colors.grayBorder,
      width: '100%'
  },
  textTag:{
    fontSize: 18,
    color: 'black'
  }
})

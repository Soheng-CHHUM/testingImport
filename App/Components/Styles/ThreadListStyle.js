import { StyleSheet,Dimensions } from 'react-native'
import {ApplicationStyles, Metrics, Colors} from '../../Themes'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  ...ApplicationStyles.search,
  ...ApplicationStyles.imageBloc,
  container: {
    width: '100%', 
    flex: 1, 
    paddingHorizontal: 20, 
    backgroundColor: 'white'
  },
  item: {
      flexDirection: 'column',
      flex: 1,
      paddingHorizontal: 12,
      backgroundColor: 'white',
      marginBottom: 5,
      height: 80,
      borderRadius: 10,
  },
  text: {
      color: Colors.mainColor,
      alignSelf: 'center'
  },
  notification:{
    flexDirection: 'row',
    backgroundColor: '#F9F2FC',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    marginTop: 6
  },
  notiNum:{
    backgroundColor:'#B360D2',
    width: 50,
    height: 50,
    borderRadius: 15,
    marginLeft: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notiDesc:{
    flexDirection: 'column',
    marginLeft: 16
  },
  confirmation:{
    flexDirection: 'row',
    width: Dimensions.get('window').width,
    marginBottom: 10
  },
  reqAvatar:{
    borderRadius: 12,
    width: 50,
    height: 50,
    marginLeft: 22
  },
  imageAvatar:{
    width: 30,
    height: 30,
    resizeMode: 'cover',
    borderRadius: 8,
    position: 'absolute',

  },
  btnConfirm:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width-96,
    paddingTop: 16
  },
  button:{
    flex: 1,
    marginRight:10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 8
  },
  txtTime:{
    fontSize:15,
    color:'grey',
    position: 'absolute',
    right: 0,
    marginRight: 10
  },
  frontImage:{
    width: '100%', 
    height: '100%'
  },
  lastColumn: {
    flex: 0.1,
    alignContent: 'center',
    alignItems: 'flex-end'
  },
  round: {
    borderRadius: 100,
    width: 8,
    height: 8,
  },
  smallImage: {
    padding: 0,
    margin: 0,
    height: Metrics.icons.tiny,
    width: Metrics.icons.tiny * 1.2365
  },
})

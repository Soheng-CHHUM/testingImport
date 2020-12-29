import { StyleSheet, Dimensions } from 'react-native'
import {ApplicationStyles, Metrics} from '../../Themes'

export default StyleSheet.create({
  ...ApplicationStyles.imageBloc,
  container: {
    flex: 1
  },
  confirmation:{
    flexDirection: 'row',
    //height: Metrics.list.line.height,
    width: Metrics.list.line.width,
    marginBottom: 10
  },
  notiDesc:{
    flexDirection: 'column',
    marginLeft: 16
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
  notiNum:{
    backgroundColor:'#B360D2',
    width: 50,
    height: 50,
    borderRadius: 15,
    marginLeft: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notification:{
    flexDirection: 'row',
    backgroundColor: '#F9F2FC',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    marginTop: 6
  },
})

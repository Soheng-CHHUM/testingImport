import React,{Component} from 'react';
import {View,Text,ScrollView,TouchableHighlight,
  TextInput,StyleSheet} from 'react-native';

export default class NestedScroll extends Component{
  constructor(props){
    super(props);
    this.state={}
  }

  render(){
    return(
      <View style={{flex:1}}>
        <Text style={{fontSize:15,color:'black'}}>Hello world</Text>
      </View>
    );
  }
}
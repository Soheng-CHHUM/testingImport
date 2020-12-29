import React, { Component } from 'react';
import {
  View, Text, Dimensions, KeyboardAvoidingView,
  TextInput, TouchableOpacity
} from 'react-native';
import styles from './Styles/CreateGroupScreenStyle'
import { ApplicationStyles } from '../Themes';
import LinearGradient from 'react-native-linear-gradient';
export default class CreateGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: '',
      txtError: "",
      countChar: 16
    }
  }

  checkInputTextIsEmpty = () => {


    const { groupName } = this.state

    if (groupName == '') {
      alert('Please fill in blank')
    }
    else {
      if (groupName.length < 3) {
        console.log("Group name must be bigger then 3 charecter")
      }
      else {
        let createGroupData = {
          name: groupName
        }
        this.props.navigation.navigate('SelectPhotoScreen', { createGroupData: createGroupData })
      }
    }
  }
  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.inputContainter}>
          <TextInput
            placeholder={'Donnez moi un nom'}
            autoCorrect={false}
            maxLength={16}
            underlineColorAndroid={'white'}
            style={styles.txtInput}
            value={this.state.groupName}
            onChangeText={(text) => { this.setState({ groupName: text }) }}
          />
          <Text style={styles.txtLength}>{(this.state.countChar - this.state.groupName.length)}</Text>
        </View>
        {this.state.groupName.length >= 3 ?
          <LinearGradient
            start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
            locations={[0, 0.6]}
            colors={['#C20657', '#B360D2']}
            style={ApplicationStyles.button}
          >
            <TouchableOpacity
              style={ApplicationStyles.linearGradiantButton}
              onPress={this.checkInputTextIsEmpty}
            >
              <Text style={{ fontSize: 18, color: 'white' }}>Continuer</Text>
            </TouchableOpacity>
          </LinearGradient>
          :
          <TouchableOpacity style={[ApplicationStyles.button, { backgroundColor: '#aeb1b5' }]}
            onPress={this.checkInputTextIsEmpty}>
            <Text style={{ fontSize: 18, color: 'white' }}>Continuer</Text>
          </TouchableOpacity>
        }






      </KeyboardAvoidingView>
    );
  }
}

import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet
} from 'react-native';
import { ApplicationStyles } from '../Themes';
import styles from './Styles/CreateGroupScreenStyle'
import LinearGradient from 'react-native-linear-gradient';

export default class GroupTypeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        { title: 'Public', description: 'Tout le monde peut participer', status: false },
        { title: 'Privé', description: "Les utilisateurs doivent faire une \ndemande de participation", status: false }
      ],
    }
    this.createGroupData = this.props.navigation.state.params.createGroupData
    this.isPublic = false
  }
  handleRadioButton = (item, index) => {
    let { data } = this.state
    if (index == 0) {
      this.isPublic = true
    }
    else {
      this.isPublic = false
    }
    data.map((eachData, eachIndex) => {
      if (index == eachIndex) {
        data[eachIndex].status = !data[eachIndex].status
      } else {
        data[eachIndex].status = false
      }
    })
    this.setState({ data });
  }
  handleContinue = () => {
    const { data } = this.state
    let mergeCreateGroupData = { ...this.createGroupData, ...{ isPublic: this.isPublic } }
    if (data[0].status == false && data[1].status == false) alert('Please selection an option')
    else this.props.navigation.navigate('CreateTagScreen', { createGroupData: mergeCreateGroupData })

  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.bigTitle}>Quelle type de visibilité ?</Text>
        <Text style={styles.description}>Choisissez une des deux options</Text>
        <View style={styles.subContainer}>
          {
            this.state.data.map((item, index) => {
              return (
                <TouchableOpacity style={styles.radioItem} onPress={() => this.handleRadioButton(item, index)}>
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.subTitle}>{item.title}</Text>
                    <Text style={styles.subDescription}>{item.description}</Text>
                  </View>
                  <View style={[styles.radio, { backgroundColor: item.status ? '#B360D2' : null }]} />
                </TouchableOpacity>
              )
            })
          }
        </View>
        <LinearGradient
          start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
          locations={[0, 0.6]}
          colors={['#C20657', '#B360D2']}
          style={ApplicationStyles.button}>
          <TouchableOpacity
            style={ApplicationStyles.linearGradiantButton}
            onPress={this.handleContinue}>
            <Text style={{ fontSize: 18, color: 'white' }}>Continuer</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }
}

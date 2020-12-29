import React, { Component } from 'react';
import {
    View, Text, Dimensions, KeyboardAvoidingView,
    TextInput, TouchableOpacity
} from 'react-native';
import styles from './Styles/CreateGroupScreenStyle'
import { ApplicationStyles } from '../Themes';
import LinearGradient from 'react-native-linear-gradient';

export default class CreateTagScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tagItems: [],
            tagName: '',
            status: true,
        }
        this.createGroupData = this.props.navigation.state.params.createGroupData
    }

    onChangeText(text) {
        this.setState({ tagName: text })
    }

    handleTerminal = (params)=>{

      let mergeCreateGroupData = {...this.createGroupData, ...{tags: this.state.tagItems}}
      this.props.navigation.navigate('GeoLocateGroupScreen', {createGroupData: mergeCreateGroupData})
    }

    addSubmit = ()=>{
      let {tagName, tagItems} = this.state
      tagName.trim()
      tagItems.push("#"+tagName);
      this.setState({tagItems, status: false, tagName: ''});
    }

    render() {
        const { status } = this.state
        const { tagItems } = this.state
        return (
            <KeyboardAvoidingView style={styles.container}>
                <View style={styles.inputContainter}>
                    <TextInput
                        placeholder={'Créez des tags'}
                        autoCorrect={false}
                        maxLength={16}
                        underlineColorAndroid={'white'}
                        style={styles.txtInput}
                        onChangeText={(text) => this.onChangeText(text)}
                        value={this.state.tagName}
                        onSubmitEditing={this.addSubmit}
                        returnKeyLabel={'Add'}
                    />
                    <Text style={styles.txtLength}>5 tags maximum</Text>
                </View>
                {
                    status ?
                        <Text style={[styles.description, { marginTop: 20 }]}>
                            Aidez les utilisateurs à trouver votre{'\n'}groupe
                        </Text>
                        :
                        tagItems.map((eachTag) => {
                            return <View style={{}}>
                                <Text style={{color: '#8F8F94',fontSize: 18,padding: 4,marginTop:10}}>{eachTag}</Text>
                            </View>
                        })
                }

                <LinearGradient
                    start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
                    locations={[0, 0.6]}
                    colors={['#C20657', '#B360D2']}
                    style={ApplicationStyles.button}>
                    <TouchableOpacity
                        style={ApplicationStyles.linearGradiantButton}
                        onPress={this.handleTerminal}>
                        <Text style={{ fontSize: 18, color: 'white' }}>Terminer</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </KeyboardAvoidingView>
        );
    }
}

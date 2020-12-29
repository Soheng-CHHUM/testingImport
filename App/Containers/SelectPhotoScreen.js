import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    TextInput, Image
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApplicationStyles } from '../Themes';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';

export default class SelectPhotoScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            picture: null,
        }
        this.createGroupData = this.props.navigation.state.params.createGroupData
    }
    pickSingleBase64(cropit) {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: cropit,
            includeBase64: true,
            includeExif: true,
        }).then(image => {
            this.setState({
              picture: `data:${image.mime};base64,` + image.data
            });
        }).catch(e => console.log(e));
    }
    checkIfImageIsNull=()=>{
        const {picture}=this.state
        if(picture==null){
            alert("Please select an picture")
        }else{
            let mergeCreateGroupData = {...this.createGroupData, ...{picture: picture}}
            this.props.navigation.navigate('GroupTypeScreen', {createGroupData:mergeCreateGroupData})
        }
    }
    render() {
        return (
            <View style={{ flex: 1, padding: 20 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'black' }}>Choisissez une photo 📸</Text>
                <Text style={{ fontSize: 18, color: 'black' }}>Ça demande du temps ? {'\n'}Non! Ça apporte du peps 😎</Text>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        bottom: 50
                    }}
                    onPress={() => this.pickSingleBase64(true)}>
                    {
                        this.state.picture==null?
                        <MaterialCommunityIcons name='camera' size={32} color='#B360D2' />
                        :
                        <Image source={{uri: this.state.picture}} style={{width: 300, height: 300}}/>
                    }
                </TouchableOpacity>

                <LinearGradient
                    start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
                    locations={[0, 0.6]}
                    colors={['#C20657', '#B360D2']}
                    style={ApplicationStyles.button}
                >
                    <TouchableOpacity
                        style={ApplicationStyles.linearGradiantButton}
                        onPress={this.checkIfImageIsNull}
                    >
                        <Text style={{ fontSize: 18, color: 'white' }}>Ajouter photo</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }
}

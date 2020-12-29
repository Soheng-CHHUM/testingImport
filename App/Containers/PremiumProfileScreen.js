import React, { Component } from 'react';
import {
    View, Image, ScrollView, TouchableOpacity, Text, FlatList
} from 'react-native';
import { Images, ApplicationStyles } from '../Themes'
import styles from './Styles/PremiumProfileScreenStyle'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'

export default class PremiumProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menu: [
                { title: "Envoyer un message privé" },
                { title: "Inviter" },
                { title: "Signaler ce profil" },
                { title: "Bloquer ce profil" }
            ]
        }
    }

    renderMenu = ({ item, index }) => {
        return <View>
            <TouchableOpacity style={styles.menu}>
                <Text style={index == 0 ? [{ color: '#B360D2' }, styles.txtMenu] : [{ color: 'white' }, styles.txtMenu]}>
                    {item.title}
                </Text>
                <AntDesign name='right' size={24} style={index == 0 ? { color: '#B360D2', paddingRight: 8 } : { color: 'white', paddingRight: 8 }} />
            </TouchableOpacity>
            <View style={styles.horizontalLine} />
        </View>
    }
    render() {
        return (
            <ScrollView style={styles.container}>

                <View style={[ApplicationStyles.topLine, { backgroundColor: '#3C3C3C' }]} />

                {/*------------  For Name only -------------*/}

                {/* <View style={styles.profileContainer}>
                    <View style={styles.imgContainer}>
                        <Image source={Images.avatar1} style={styles.imgProfile} />
                    </View>
                    <Text style={styles.txtName}>Jose1986</Text>
                    <TouchableOpacity style={styles.crossButton}>
                        <Ionicons name='md-close-circle' size={38} color='#8F8F94' />
                    </TouchableOpacity>
                </View> */}
                
                <View style={styles.profileContainer}>
                    <View style={styles.imgContainer}>
                        <Image source={Images.avatar1} style={styles.imgProfile} />
                    </View>
                    <View style={styles.profileText}>
                        <Text style={styles.txtName1}>Jose1986</Text>
                        <Text style={{ fontSize: 15, color: 'white' }}>Group: 14</Text>
                        <Text style={{ fontSize: 15, color: 'white' }}>Amis en commun : 45</Text>
                    </View>
                    <TouchableOpacity style={styles.crossButton}>
                        <Ionicons name='md-close-circle' size={38} color='#8F8F94' />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 18, color: 'white', margin: 24, textAlign: 'center' }}>
                    Malheureusement cet utilisateur n’est pas  en version Premium, invitez le à passer Premium pour communiquer avec lui.
                </Text>
                <View style={styles.horizontalLine} />
                <FlatList
                    data={this.state.menu}
                    renderItem={this.renderMenu}
                />
                <Image source={Images.white_logo} style={{ width: 120, height: 120, alignSelf: 'center' }} />
            </ScrollView>
        );
    }
}

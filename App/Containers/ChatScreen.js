import React, { Component } from 'react';
import {
    View, Text, ScrollView, TouchableHighlight,
    Image, TouchableOpacity, ImageBackground, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import { Images, ApplicationStyles } from '../Themes'
import MessageList from '../Components/MessageList'
import RecordButton from '../Components/RecordButton';
import ThreadList from '../Components/ThreadList'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import styles from './Styles/ChatScreenStyle'
import LinearGradient from 'react-native-linear-gradient';
import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog';


export default class ChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPubChatSelected: true,
            premiumAnimationDialog: false,
            welcomeAnimationDialog: false
        }
    }

    handlePressChat = (status) => {
        this.setState({ isPubChatSelected: status });
    }
    handlePressProfile() {
        // alert("Profile available soon")
        this.props.navigation.navigate('ProfileScreen')

    }
    handlePressSearch = () => {
        this.props.navigation.navigate('SearchScreen')
    }
    render() {
        const { isPubChatSelected } = this.state
        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                {/*  - - - -- -  --  - Chat container  - - - - - - --  */}
                <View style={{ flex: 1, backgroundColor: 'white', zIndex: 1, marginTop: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={ApplicationStyles.topLine} />
                    <View style={styles.btnTitleContainer}>

                        {/* -- - - - - - - - - --  tab Chat public and Private - - --  -- - - - - -  - - */}
                        <TouchableOpacity onPress={() => this.handlePressChat(true)} style={[styles.chatButton, { backgroundColor: isPubChatSelected ? 'black' : '#FAFAFA' }]}>
                            <Text style={{ fontSize: 15, color: isPubChatSelected ? 'white' : 'black' }}>Chat Public</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.handlePressChat(false)} style={[styles.chatButton, { flexDirection: 'row', backgroundColor: !isPubChatSelected ? 'black' : '#FAFAFA' }]}>
                            <Text style={{ fontSize: 15, color: !isPubChatSelected ? 'white' : 'black', marginRight: 8 }}>Chat Privé</Text>
                            <Text style={{ fontSize: 15, color: 'white', backgroundColor: '#B360D2', paddingLeft: 8, paddingRight: 8, borderRadius: 8 }}>3</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('SearchScreen')}
                            style={styles.searchContainer}>
                            <Icon name='search' size={18} />
                        </TouchableOpacity>

                    </View>

                    <View style={{ marginLeft: 12, flexDirection: 'row' }}>
                        <Icon name='map-marker' size={20} color='black' />
                        <Text style={{ color: 'black', marginLeft: 10 }}>5km autour de vous</Text>
                    </View>

                    {/* public chat */}

                    {
                        isPubChatSelected ?

                            <MessageList
                                recordsSource='Tous'
                                user={{
                                    nbKmLimitZone: 40,
                                    Key: '-LaGbltJkrVT-c-xqhUq',
                                    Name: 'Kevin',
                                    status: 'online'
                                }}
                            />
                            :
                            // <ThreadList
                            //     user={this.state.curUser}
                            //     onPress={(user, chatroom) => {
                            //         if (this.isCancelled) return;

                            //         //UserService.reloadThread(chatroom.key);

                            //         //this.setState({selectedChatUser: user, chatroom, selectedThread: chatroom.key})
                            //     }} />
                            <Text style={{ fontSize: 15, color: 'black' }}>Private</Text>
                    }

                </View>
                <ImageBackground source={Images.navBar} style={styles.backgroundBottomNav} >
                    <TouchableOpacity style={styles.btnBottomNav}
                        onPress={() => {
                            this.setState({
                                premiumAnimationDialog: true,
                            });
                        }}>
                        <EntypoIcon name='chat' size={22} color='white' />
                        <Text style={{ color: 'white' }}>Premium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.recordButton}>
                        <RecordButton
                            isRecordDeviceFree={true}
                            onStartRecord={() => { }}
                            onStopRecord={() => { }}
                            recordsSource={'Tous'}
                            currentUserLocation={null}
                            user={{
                                Key: '#12345'
                            }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnBottomNav} onPress={this.handlePressProfile}>
                        <Ionicons name='ios-person' size={22} color='white' />
                        <Text style={{ color: 'white' }}>Mon 1212 Profil</Text>
                    </TouchableOpacity>
                </ImageBackground>

                {/* --------Premium Dialog-------- */}
                <Dialog
                    onDismiss={() => {
                        this.setState({ premiumAnimationDialog: false });
                    }}
                    onTouchOutside={() => {
                        this.setState({ premiumAnimationDialog: false });
                    }}
                    width={Dimensions.get('window').width}
                    visible={this.state.premiumAnimationDialog}
                    dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
                    dialogStyle={{ position: 'absolute', bottom: 0 }}
                >
                    <View style={ApplicationStyles.topLine} />
                    <TouchableOpacity
                        style={{ right: 0, position: 'absolute', margin: 10 }}
                        onPress={() => { this.setState({ premiumAnimationDialog: false }) }}
                    >
                        <Ionicons name='md-close-circle' size={24} />
                    </TouchableOpacity>
                    <DialogContent style={{ justifyContent: 'center', marginTop: 10 }}>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.txtDescription}>Passez en version premium pour envoyer des messages privés, faire des rencontres et créer vos groupes.</Text>
                            <Text style={[styles.txtDescription, { marginTop: 20 }]}>Le prix d'abonnement est de 0.99 €. Testez-le gratuitement pendant 1 mois !</Text>
                        </View>
                        <View style={styles.btnConfirmContainer}>
                            <LinearGradient
                                start={{ x: 0.0, y: 0.25 }} end={{ x: 2.0, y: 4.0 }}
                                locations={[0, 0.6]}
                                colors={['#C20657', '#B360D2']}
                                style={styles.btnConfirmStyle}>
                                <TouchableOpacity
                                    style={ApplicationStyles.linearGradiantButton}
                                    onPress={() => {
                                    this.setState({ welcomeAnimationDialog: true });
                                    this.setState({ premiumAnimationDialog: false });

                                }}>
                                    <Text style={{ fontSize: 18, color: 'white' }}>Continuer</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                            <TouchableOpacity
                                style={styles.btnConfirmStyle}
                                onPress={() => { this.setState({ premiumAnimationDialog: false }) }}
                            >
                                <Text style={styles.txtDescription}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </DialogContent>
                </Dialog>
                {/* --------------Welcome Dialog-------------  */}
                <Dialog
                    onDismiss={() => {
                        this.setState({ welcomeAnimationDialog: false });
                    }}
                    onTouchOutside={() => {
                        this.setState({ welcomeAnimationDialog: false });
                    }}
                    width={Dimensions.get('window').width}
                    visible={this.state.welcomeAnimationDialog}
                    dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
                    dialogStyle={{ position: 'absolute', bottom: 0 }}>
                    <View style={ApplicationStyles.topLine} />
                    <TouchableOpacity
                        style={{ right: 0, position: 'absolute', margin: 10 }}
                        onPress={() => { this.setState({ welcomeAnimationDialog: false }) }}>
                        <Ionicons name='md-close-circle' size={24} />
                    </TouchableOpacity>
                    <DialogContent style={{ justifyContent: 'center', marginTop: 10 }}>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.txtDescription}>Bienvenue ! ☺️</Text>
                            <Text style={[styles.txtDescription, { marginTop: 20 }]}>Vous êtes en version premium ! Retrouvez vos groupes d'intérêt et vos amis</Text>
                        </View>
                        <View style={styles.btnConfirmContainer}>
                            <TouchableOpacity
                                style={styles.btnConfirmStyle}
                                onPress={() => {
                                    this.setState({
                                        welcomeAnimationDialog: false
                                    })
                                }}>
                                <Text style={styles.txtDescription}>Premium</Text>
                            </TouchableOpacity>
                        </View>
                    </DialogContent>
                </Dialog>
            </View >

        );
    }
}

// export default ChatScreen;

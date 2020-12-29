import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, Image, Text, View, BackHandler,FlatList, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from 'native-base';
import UserService from '../Services/User'
import { connect } from 'react-redux'
import AuthActions from '../Redux/AuthRedux'
const numColumns = 3;
class SelectAvataScreen extends Component {
    constructor(props) {
        super(props);
        this.unsubscribe = null;
        this.state = {
            phoneNumber: '',
            stringGmail: '@gmail.com',
            avatarList: [],
            userData: null,
            isLoadingMore: false
        };
        global.currentScene = "SelectAvataScreen";
        this.page_no = 1;
        this.isPagniationEnded = false;
    }
    static navigationOptions = ({ navigation }) => {
        return {
            headerStyle: {
                elevation: 0,
            },
            headerLeft: (
                <TouchableOpacity onPress={navigation.getParam('goBack')} style={{ paddingLeft: 12 }}>
                    {/* <Icon name='left' type="AntDesign" style={{ fontSize: 28, color: '#B360D2' }} /> */}
                </TouchableOpacity>
            )
        };
    };
    _goBack = () => {
        this.props.navigation.goBack(null)
    }
    componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressed);
        this.props.navigation.setParams({ goBack: this._goBack });
    }
    onBackButtonPressed = () => {
      return true;
    }
    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressed);
      if (this.unsubscribe) this.unsubscribe();
    }
    renderItem = ({ item, index }) => {
        // if (!item) return false;
        return (
            <View style={{ flex: 1, justifyContent: 'center', marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                    <View style={styles.item}>
                        <TouchableOpacity onPress={() => this.handleImageClick(item)}>
                            <Image
                                style={{
                                    width: 90, height: 90, borderRadius: 50,
                                    borderColor: '#B360D2', borderWidth:0.5
                                }}
                                source={{ uri: item }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };
    handleImageClick = (item) => {
        let { userData } = this.state
        let newUserData = { ...userData, ...{ Avatar: item } }
        this.setState({ userData: newUserData });
        UserService.updateUser(newUserData)
        this.props.setUser(newUserData)
        this.props.navigation.navigate('ShareOption')
        // global.contactIsSynchroniser==true?this.props.navigation.navigate('InviteContactScreen'):this.props.navigation.navigate('MapScreen')

      }
    componentWillMount = () => {
        let {userData} = this.state
        if(this.props.user){
            userData = this.props.user;
        }
        this.setState({userData});
        this.handleGetAvatarPerPage(this.page_no)
        AsyncStorage.getItem("phoneNumber").then((value) => {
            this.setState({ phoneNumber: value });
        })
    }

    handleGetAvatarPerPage = (page_no)=>{
      UserService.getAvatar(page_no, (resAvatar) => {
        if(resAvatar.length != this.state.avatarList.length){
          this.isPagniationEnded = false;
        }else{
          this.isPagniationEnded = true;
        }
        this.setState({ avatarList: [...resAvatar], isLoadingMore: false });
      });
    }

    loadMoreAvatar = ()=>{
      if(!this.isPagniationEnded){
        this.page_no +=1;
        this.setState({isLoadingMore: true});
        this.handleGetAvatarPerPage(this.page_no);
      }
    }

    render() {
        return (
            // <ScrollView>

                <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 8, paddingRight: 8, backgroundColor: 'white' }}>

                    {global.fromScreenName == "editAvatar" ? null :
                        <View style={{ height: 120, paddingLeft: 20, justifyContent: 'center' }}>
                            <View>
                                <Text style={{ marginRight: 7, fontSize: 26, fontWeight: 'bold',color:'black' }}>Votre avatar</Text>
                            </View>
                            <View style={{ height: 50, flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ fontSize: 18, marginRight: 5 }}>Choisissez un avatar</Text>
                                </View>
                                <View>
                                    <Image
                                        style={{ width: 20, height: 20, marginLeft: 5 }}
                                        source={require('../Images/emojiClass.png')}
                                    />
                                </View>
                            </View>
                        </View>
                    }
                    <View style={{ flex: 1, backgroundColor: 'orange' }}>
                        <FlatList
                            data={this.state.avatarList}
                            style={styles.container}
                            renderItem={this.renderItem}
                            numColumns={3}
                            keyExtractor={(item, index) => index.toString()}

                            onEndReached={this.loadMoreAvatar}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={() => {
                                return (
                                this.state.isLoadingMore?
                                    <View style={{ alignItems: 'center', height: 70}}>
                                        <ActivityIndicator size = "large" color='#648CB4' style={{justifyContent: 'center',alignItems: 'center'}}/>
                                    </View>
                                :null
                                );
                            }}


                        />
                    </View>
                </View>
            // </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        margin: 1,
        height: Dimensions.get('window').width / numColumns, // approximate a square
    },
    itemInvisible: {
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = (state) => {
    return {
        user: state.auth.user
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        setUser: (user) => dispatch(AuthActions.authSetUser(user)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectAvataScreen)





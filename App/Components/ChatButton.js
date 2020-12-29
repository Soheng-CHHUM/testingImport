import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity } from 'react-native'
import Translator from '../Translations/Translator'
import Images from '../Themes/Images'
import styles from './Styles/ChatButtonStyle'
import PremiumPopUp from './PremiumPopUp'
import { withNavigation } from 'react-navigation'

class ChatButton extends Component {
  // // Prop type warnings
  static propTypes = {
    user: PropTypes.object.isRequired,
    on_press_title: PropTypes.string,
    chatroom: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      isPopUpPremiumVisible: false,
    }
    global.fromSceneName = ''
  }

  onPremiumPopUpVisibilityChanged(isVisible) {
    if (isVisible != this.state.isPopUpPremiumVisible) {
      this.setState({ isPopUpPremiumVisible: isVisible })
    }
  }

  onPressCreateGroup = () => {
    global.chatroom = null;
    this.props.navigation.navigate('CreateGroupScreen')
  }
  
  onPressFindFriendsScreen = () => {
    global.fromSceneName = 'MapScreen'
    this.props.navigation.navigate('InviteFriendsIntoGroupScreen', { invite_method: 'update', chatroom: this.props.chatroom })
  }

  onPressPremium() {
    this.setState({ isPopUpPremiumVisible: !this.state.isPopUpPremiumVisible })
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.props.on_press_title && this.props.on_press_title == "group" ?
            <View>
              <TouchableOpacity onPress={() => this.onPressFindFriendsScreen()}>
                <Image source={Images.icGroup} style={[styles.smallImage, { marginBottom: 2 }]} resizeMode='contain' />
                <Text style={styles.text}>Inviter amis</Text>
              </TouchableOpacity>
              <PremiumPopUp isVisible={this.state.isPopUpPremiumVisible} onVisibilityChanged={(isVisible) => this.onPremiumPopUpVisibilityChanged(isVisible)} />
            </View>
            :
            this.props.user && this.props.user.isPremium ?
              <View>
                <TouchableOpacity onPress={() => this.onPressCreateGroup()}>
                  <Image source={Images.icGroup} style={[styles.smallImage, { marginBottom: 2 }]} resizeMode='contain' />

                  <Text style={styles.text}>{Translator.t('common.create_group')}</Text>

                </TouchableOpacity>
                <PremiumPopUp isVisible={this.state.isPopUpPremiumVisible} onVisibilityChanged={(isVisible) => this.onPremiumPopUpVisibilityChanged(isVisible)} />
              </View>
              :
              <View>
                <TouchableOpacity onPress={() => this.onPressPremium()}>
                  <Image source={Images.icChat} style={styles.smallImage} resizeMode='contain' />
                  <Text style={styles.text}>{Translator.t('common.premium')}</Text>
                </TouchableOpacity>
                <PremiumPopUp isVisible={this.state.isPopUpPremiumVisible} onVisibilityChanged={(isVisible) => this.onPremiumPopUpVisibilityChanged(isVisible)} />
              </View>
        }
      </View>
    )
  }
}

export default withNavigation(ChatButton);


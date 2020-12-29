import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Alert, Text, View, TouchableOpacity, Dimensions, Platform, Image } from 'react-native'

import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';
import { Colors, Metrics, ApplicationStyles, Images } from '../Themes'

import Ionicons from 'react-native-vector-icons/Ionicons'
import Emoji from 'react-native-emoji'

import UserService from '../Services/User'
import AuthActions from '../Redux/AuthRedux'

// Styles
import styles from './Styles/PremiumPopUpStyle'
import RoundedCornerButton from './RoundedCornerButton';
import { withNavigation } from 'react-navigation'

import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener
} from 'react-native-iap';

import Translator from '../Translations/Translator'
import PopUp from './PopUp';

const PACKAGE_NAME = 'com.bebeep'

class PremiumPopUp extends Component {

  constructor (props) {
    super(props)
    this.state = {
      premiumAnimationDialog: props.isVisible,
      isPaymentSuccess: false,
      isProcessing: false
    }
    global.isPremium=false
  }

  componentDidMount() {
    RNIap.initConnection().then(() => {})

    RNIap.getProducts([PACKAGE_NAME]).then((products) => {
      console.log('FOUND PRODUCTS', products)
    }).catch((err) => {
      console.log('CATCH PRODUCTS', err)
    })

    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => this.onPurchaseUpdated(purchase));

    this.purchaseErrorSubscription = purchaseErrorListener((error) => this.onPurchaseError(error));
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  componentWillReceiveProps(props) {
    if(props.isVisible != this.state.premiumAnimationDialog) this.setState({premiumAnimationDialog: props.isVisible})
  }

  changeVisibility(isVisible) {
    this.setState({premiumAnimationDialog: isVisible}, () => {
      if(this.props.onVisibilityChanged) return this.props.onVisibilityChanged(isVisible)
    })
  }

  onPaymentSuccess() {
    if(this.props.user){
      UserService.updateUser({
        Key: this.props.user.Key,
        isPremium: true
      })

      this.setState({ isPaymentSuccess: true, isProcessing: false }, () => {
        this.props.setUser({
          ...this.props.user,
          isPremium: true
        })
      });

    }

  }

  onPurchaseError(error) {

    console.log('PURCHASE ERROR', error)

    if(true) {
      //development mode let's continue on the next page for now
      //TODO remove this block
      return this.onPaymentSuccess()
    }

    this.setState({ isProcessing: false });

    Alert.alert(Translator.t('errors.error'), Translator.t('errors.buy_product'))
  }

  onPurchaseUpdated(purchase) {

    const receipt = purchase.transactionReceipt;

    this.changeVisibility(false)

    console.log('PURCHASE SUCCESS', receipt)

    if (receipt) {

      let numTransaction = ''

      if (Platform.OS === 'ios') {
        numTransaction = purchase.transactionId
        RNIap.finishTransactionIOS(purchase.transactionId);
      } else if (Platform.OS === 'android') {
        numTransaction = purchase.purchaseToken
        // If consumable (can be purchased again)
        RNIap.consumePurchaseAndroid(purchase.purchaseToken);

        // If not consumable
        RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
      }

      Alert.alert(Translator.t('success.congrats'), Translator.t('success.buy_product', {
        num_transaction: numTransaction
      }))

      return this.onPaymentSuccess()
    }

    return this.setState({ isPaymentSuccess: false, isProcessing: false });
  }

  requestPurchase = async (sku) => {

    if(this.state.isProcessing) return

    this.setState({isProcessing: true})

    try {
      await RNIap.requestPurchase(sku, false);
    } catch (err) {

      this.setState({isProcessing: false}, () => {
        Alert.alert(Translator.t('errors.error'), Translator.t('errors.buy_product'))
        console.warn(err.code, err.message);
      })
    }
  }

  onPressPremium() {
    this.requestPurchase(PACKAGE_NAME)
  }

  onPressContinue() {
    this.changeVisibility(false)
    this.props.navigation.navigate('FindFriendsScreen')
  }

  renderSuccessBloc() {
    return <PopUp
      onVisibilityChanged={(isVisible) => this.changeVisibility(isVisible)}
      isVisible={this.state.premiumAnimationDialog}
      title={`${Translator.t('common.welcome')} ! `}
      titleRightContent={() => <Image style={{width: Metrics.icons.medium, height: Metrics.icons.medium}} source={Images.emojis.smile} />}
      descriptionLines={[{
        text: `${Translator.t('success.buy_product_text')} !`
      }]}
      descriptionContainerStyle={{ marginTop: 40, marginLeft: 0, padding: 0}}
      hasConfirmContainer={true}
      hasConfirmButton={true}
      confirmText={Translator.t('common.continue')}
      onConfirmPressed={() => this.onPressContinue()} />
  }

  renderPurchaseBloc() {
    return <PopUp
      onVisibilityChanged={(isVisible) => this.changeVisibility(isVisible)}
      isVisible={this.state.premiumAnimationDialog}
      hasConfirmContainer={true}
      hasConfirmButton={true}
      hasCancelButton={true}
      descriptionLines={
        [{
          text: 'Passez en version premium pour envoyer des messages privés, faire des rencontres'
        }, {
          text: ' et créer vos groupes.'
        }, {
          style: { marginTop: 20 },
          text: "Le prix d'abonnement est de 0.99 €."
        }, {
          text: 'Testez-le gratuitement pendant 1 mois !'
        }]
      }
      confirmText={Translator.t('common.premium')}
      onConfirmPressed={() => this.onPressPremium()}  />

  }

  render () {
    return (
      this.state.isPaymentSuccess ?
        this.renderSuccessBloc() : this.renderPurchaseBloc()

    )
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(PremiumPopUp))

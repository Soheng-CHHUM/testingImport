import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native'
import styles from './Styles/PopUpStyle'
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';
import RoundedCornerButton from './RoundedCornerButton';
import { Colors, Metrics, ApplicationStyles } from '../Themes'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Translator from '../Translations/Translator'

export default class PopUp extends Component {
  // // Prop type warnings
  static propTypes = {
    isVisible: PropTypes.bool,
    onVisibilityChanged: PropTypes.func,
    title: PropTypes.string,
    titleRightContent: PropTypes.func,
    hasConfirmContainer: PropTypes.bool,
    hasConfirmButton: PropTypes.bool,
    hasCancelButton: PropTypes.bool,
    descriptionContainerStyle: PropTypes.object,
    descriptionLines: PropTypes.arrayOf(PropTypes.object),
    confirmText: PropTypes.text,
    onConfirmPressed: PropTypes.func,
    cancelText: PropTypes.text,
    onCancelPressed: PropTypes.func,
  }

  static defaultProps = {
    descriptionLines: [],
    descriptionContainerStyle: {}
  }

  constructor(props) {
    super(props)

    this.state = {
      isVisible: props.isVisible
    }
  }

  componentWillReceiveProps(props) {
    if(props.isVisible != this.state.isVisible) this.setState({isVisible: props.isVisible})
  }

  changeVisibility(isVisible) {
    this.setState({isVisible}, () => {
      if(this.props.onVisibilityChanged) return this.props.onVisibilityChanged(isVisible)
    })
  }

  renderTitle() {
    return this.props.title &&
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{this.props.title}</Text>
        {
          this.props.titleRightContent &&
            this.props.titleRightContent()
        }
      </View>
  }

  renderDescription() {
    return <View style={[styles.descriptionContainer, this.props.descriptionContainerStyle]}>
      {
        this.props.descriptionLines.map(elt => {
          return <Text style={[styles.txtDescription, { padding: 0, margin: 0 }, elt.style ? elt.style : {}]}>{elt.text}</Text>
        })
      }
    </View>
  }

  renderConfirm() {

    return this.props.hasConfirmContainer &&
      <View style={[styles.btnConfirmContainer, { marginTop: 20}]}>
        {
          this.props.hasConfirmButton &&
            <RoundedCornerButton
            containerStyle={{width: '100%', height: Metrics.buttons.small}}
            text={this.props.confirmText ? this.props.confirmText : Translator.t('common.continue')}
            onPress={() => this.props.onConfirmPressed()} />
        }

        {
          this.props.hasConfirmButton && this.props.hasCancelButton &&
            <View style={{width: 20}}></View>
        }

        {
          this.props.hasCancelButton &&
            <RoundedCornerButton
              gradient={[]}
              text={this.props.cancelText ? this.props.cancelText : Translator.t('common.cancel')}
              textColor={Colors.black}
              containerStyle={{
                width: '45%',
                height: Metrics.buttons.small,
                alignSelf: 'flex-start'
              }}
              buttonStyle={{
                backgroundColor: Colors.white,
                borderWidth: 2,
                borderColor: Colors.grayBorder
              }}
              onPress={() => {
                this.changeVisibility(false);
              }} />
        }
      </View>
  }

  renderContent() {
    return <View style={styles.contentContainer}>
      {
        this.renderTitle()
      }

      {
        this.renderDescription()
      }

      {
        this.renderConfirm()
      }

    </View>
  }

  render () {

    return (
      <Dialog
        onDismiss={() => {
            this.changeVisibility(false);
        }}
        onTouchOutside={() => {
          this.changeVisibility(false);
        }}
        width={Metrics.screenWidth}
        rounded={false}
        visible={this.state.isVisible}
        dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
        dialogStyle={[styles.dialog, {borderRadius: Metrics.popUpRadius }]}
      >
        <View style={ApplicationStyles.topLine} />

        <TouchableOpacity
            style={ styles.closeButtonContainer }
            onPress={() => { this.changeVisibility(false) }}
        >
            <Ionicons name='md-close-circle' size={22} />
        </TouchableOpacity>


        <DialogContent style={{ justifyContent: 'center', marginTop: 50 }}>

            {
              this.renderContent()
            }

        </DialogContent>
      </Dialog>
    )
  }
}

import React, { Component } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Animated,
  Dimensions,
  PanResponder,
  Easing,
  View,
  Text
} from "react-native";
import { Bar } from "./Bar";
import { Close } from "./Close";

import PropTypes from "prop-types";

const FULL_HEIGHT = Dimensions.get("window").height;
const FULL_WIDTH = Dimensions.get("window").width;
const FULL_MEDIUM_HEIGHT = FULL_HEIGHT/2;
const CONTAINER_HEIGHT = FULL_HEIGHT - 100;

const STATUS = {
  CLOSED: 0,
  SMALL: 1,
  LARGE: 2
};


class SwipeablePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showComponent: false,
      opacity: new Animated.Value(0),
      canScroll: true,
      status: STATUS.CLOSED,
      refreshRelease: true
    };

    this.countMoving = 0;
    this.sizeLevelSwipe = 'medium' //small, medium, large
    this.currentTop = 0;

    this.pan = new Animated.ValueXY({ x: 0, y: FULL_HEIGHT });
    this.oldPan = { x: 0, y: 0 };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.countMoving = 0;

        const { status } = this.state;
        if(this.sizeLevelSwipe=="large"){
          this.pan.setOffset({ x: this.pan.x._value, y: 0 });
        }else if(this.sizeLevelSwipe=="morethan_medium"){
          this.pan.setOffset({ x: this.pan.x._value, y: FULL_HEIGHT - FULL_MEDIUM_HEIGHT-200 });
        }else if(this.sizeLevelSwipe=="medium"){
          this.pan.setOffset({ x: this.pan.x._value, y: FULL_HEIGHT - FULL_MEDIUM_HEIGHT });
        }else{
          this.pan.setOffset({ x: this.pan.x._value, y: FULL_HEIGHT-200 });
        }
        this.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
          this.countMoving +=1;
          const currentTop = this.pan.y._offset + gestureState.dy;
          this.currentTop = currentTop;
          if (currentTop > 0 && currentTop < FULL_HEIGHT-200 && this.countMoving>4) {
              this.props.handleMovingWindow(true,this.sizeLevelSwipe, this.currentTop, true)
              this.pan.setValue({ x: 0, y: gestureState.dy });
          }
      },

      onPanResponderRelease: (evt, { vx, vy }) => {
        if(this.countMoving<4){
          this.countMoving = 0;
          this.props.handleMovingWindow(false,this.sizeLevelSwipe, this.currentTop, false)
          return true;
        }
        this.pan.flattenOffset();
        const distance = this.oldPan.y - this.pan.y._value;
        const absDistance = Math.abs(distance);
        const { status } = this.state;
        const { onlyLarge } = this.props;
        if (status === STATUS.LARGE) {
          this.countMoving = 0;
          if (absDistance < 100) {
            this.sizeLevelSwipe = 'large'
            this._animateToLargePanel();
          } else if ( 100 < absDistance && absDistance < CONTAINER_HEIGHT - 200) {
            if (onlyLarge) {
              this.sizeLevelSwipe = 'large'
              this._animateToLargePanel();
            } 
            else if(absDistance<FULL_MEDIUM_HEIGHT){
              this.sizeLevelSwipe = 'morethan_medium' 
              this._animateToMoreThanMediumPanel();
            }
            else {
              this.sizeLevelSwipe = 'medium' 
              this._animateToMediumPanel();
            }
          } else{
            this._animateToSmallPanel();
            this.sizeLevelSwipe = 'small'
          }
        } else {
          this.countMoving = 0;
          if (distance < -100) {
            if(this.sizeLevelSwipe=="morethan_medium" && distance<-100){
              this.sizeLevelSwipe = 'medium' 
              this._animateToMediumPanel();
            }else if(this.sizeLevelSwipe=="morethan_medium" && distance>-100){
              this.sizeLevelSwipe = 'small'
              this._animateToSmallPanel();
            }else{
              this.sizeLevelSwipe = 'small'
              this._animateToSmallPanel();
            }
            // if(this.)
          } else if (distance > 0 && distance > 200) { 
            if(this.sizeLevelSwipe=="small" && distance>300 || this.sizeLevelSwipe=="medium" && distance>300){
              this.sizeLevelSwipe = 'large' 
              this._animateToLargePanel();
            }else{
                 this.sizeLevelSwipe = 'morethan_medium' 
                this._animateToMoreThanMediumPanel();
            }
          } else {
            if(this.sizeLevelSwipe=="morethan_medium" && distance>100){
              this.sizeLevelSwipe = 'large' 
              this._animateToLargePanel();
            }else{
              this.sizeLevelSwipe = 'medium' 
              this._animateToMediumPanel();
            }
          }
        }
        this.countMoving = 0;
        this.props.handleMovingWindow(false,this.sizeLevelSwipe, this.currentTop, true)
        this.setState({refreshRelease: true});
      }
    });
  }

  componentDidMount(){
    this.initialSwipePanel();
  }

  _animateToLargePanel = () => {
    this._animateSpringPan(0, 0, 200);
    this.setState({ canScroll: true, status: STATUS.LARGE });
    this.oldPan = { x: 0, y: 0 };
  };

  _animateToMoreThanMediumPanel = () => {
    this._animateSpringPan(0, FULL_HEIGHT - (FULL_MEDIUM_HEIGHT+200), 300);
    this.setState({ status: STATUS.SMALL });
    this.oldPan = { x: 0, y: FULL_HEIGHT - (FULL_MEDIUM_HEIGHT+200) };
  };

  _animateToMediumPanel = () => {
    this._animateSpringPan(0, FULL_HEIGHT - FULL_MEDIUM_HEIGHT, 300);
    this.setState({ status: STATUS.SMALL });
    this.oldPan = { x: 0, y: FULL_HEIGHT - FULL_MEDIUM_HEIGHT };
  };

  _animateToSmallPanel = () => {
    this._animateSpringPan(0, FULL_HEIGHT - 200, 300);
    this.setState({ status: STATUS.SMALL });
    this.oldPan = { x: 0, y: FULL_HEIGHT - 200 };
  };

  openLarge = () => {
    this.setState({
      showComponent: true,
      status: STATUS.LARGE,
      canScroll: true
    });
    Animated.parallel([
      this._animateTimingPan(),
      this._animateTimingOpacity(1, 300)
    ]);
    this.oldPan = { x: 0, y: 0 };
  };

  initialSwipePanel = () => {
    this.setState({ showComponent: true, status: STATUS.SMALL });
    Animated.parallel([
      this._animateTimingPan(0, FULL_HEIGHT - FULL_MEDIUM_HEIGHT),
      this._animateTimingOpacity(1, 300)
    ]);
    this.oldPan = { x: 0, y: FULL_HEIGHT - FULL_MEDIUM_HEIGHT };
  };

  
  _animateSpringPan = (x, y, duration) => {
    return Animated.spring(this.pan, {
      toValue: { x, y },
      easing: Easing.bezier(0.05, 1.35, 0.2, 0.95),
      duration: duration,
      useNativeDriver: true
    }).start();
  };

  _animateTimingOpacity = (toValue, duration) => {
    return Animated.timing(this.state.opacity, {
      toValue,
      easing: Easing.bezier(0.5, 0.5, 0.5, 0.5),
      duration,
      useNativeDriver: true
    }).start();
  };

  _animateTimingPan = (
    x = 0,
    y = 0,
    duration = 500,
    easing = Easing.bezier(0.05, 1.35, 0.2, 0.95)
  ) => {
    return Animated.timing(this.pan, {
      toValue: { x, y },
      easing,
      duration,
      useNativeDriver: true
    }).start();
  };
  
  render() {
    const { showComponent, opacity, status } = this.state;
    const {
      style,
    } = this.props;
    return showComponent ? (
      
      <Animated.View
        style={[
              SwipeablePanelStyles.container,
              { width:FULL_WIDTH},
              { transform: this.pan.getTranslateTransform() },
              style,
        ]}
        {...this._panResponder.panHandlers}
      >
          <Bar />
        
          <ScrollView
            contentContainerStyle={
              SwipeablePanelStyles.scrollViewContentContainerStyle
            }
          >
            <TouchableHighlight>
              <React.Fragment>{this.props.children}</React.Fragment>
            </TouchableHighlight>
          </ScrollView>

      </Animated.View>
    ) : null;
  }
}

SwipeablePanel.propTypes = {
  isActive: PropTypes.bool.isRequired,
  style: PropTypes.object,
  openLarge: PropTypes.bool,
  onlyLarge: PropTypes.bool,
  handleMovingWindow: PropTypes.func,
};

SwipeablePanel.defaultProps = {
  style: {},
  openLarge: false,
  onlyLarge: false
};

const SwipeablePanelStyles = StyleSheet.create({
  background: {
    position: "absolute",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: FULL_WIDTH,
    height: FULL_HEIGHT
  },
  container: {
    position: "absolute",
    height: CONTAINER_HEIGHT,
    width: FULL_WIDTH - 50,
    transform: [{ translateY: FULL_HEIGHT - 100 }],
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // shadowColor: "#000",
    // shadowOffset: {
      // width: 0,
      // height: 1
    // },
    // shadowOpacity: 0.18,
    // shadowRadius: 1.0,
    // elevation: 1,
    zIndex: 2
  },
  scrollViewContentContainerStyle: {
    width: "100%"
  }
});

export default SwipeablePanel;

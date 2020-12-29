import React, { Component } from 'react'
import { createStackNavigator, createAppContainer } from 'react-navigation'
import FindContactsScreen from '../Containers/FindContactsScreen'
import FindGroupScreen from '../Containers/FindGroupScreen'
import FindFriendsScreen from '../Containers/FindFriendsScreen'
import NotificationHandler from '../Containers/NotificationHandler'
import LaunchScreen from '../Containers/LaunchScreen'
import HomeScreens from '../Containers/HomeScreens'
import LoginScreen from '../Containers/LoginScreen'
import RegisterScreen from '../Containers/RegisterScreen'
import CreateAccountScreen from '../Containers/CreateAccountScreen'
import InviteContactScreen from '../Containers/InviteContactScreen'
import SelectAvataScreen from '../Containers/SelectAvataScreen'
import MapScreen from '../Containers/MapScreen'
import SearchScreen from '../Containers/SearchScreen'
import PrivateGroupScreen from '../Containers/PrivateGroupScreen'
import CreateGroupScreen from '../Containers/CreateGroupScreen'
import SelectPhotoScreen from '../Containers/SelectPhotoScreen'
import GroupTypeScreen from '../Containers/GroupTypeScreen'
import CreateTagScreen from '../Containers/CreateTagScreen'
import GeoLocateGroupScreen from '../Containers/GeoLocateGroupScreen'
import InviteFriendToJoinGroupScreen from '../Containers/InviteFriendToJoinGroupScreen'
import InviteFriendsIntoGroupScreen from '../Containers/InviteFriendsIntoGroupScreen'
import GeoLocalizeScreen from '../Containers/GeoLocalizeScreen'
import PremiumProfileScreen from '../Containers/PremiumProfileScreen'
// import SearchList from '../Components/SearchList'


import styles from './Styles/NavigationStyles'
import EditProfileScreen from '../Containers/EditProfileScreen';
import { GroupAdmin } from '../Containers/GroupAdmin'
import { ShareOption } from '../Containers/ShareOption'


// Manifest of possible screens
const PrimaryNav = createStackNavigator(
  {
    NotificationHandler: { screen: NotificationHandler },
    LaunchScreen: { screen: LaunchScreen },
    HomeScreens: {
      screen: HomeScreens,
      navigationOptions: {
        header: null
      }
    },
    MapScreen: {
      screen: MapScreen,
      navigationOptions: {
        header: null
      }
    },
    FindGroupScreen: { screen: FindGroupScreen },
    LoginScreen: { screen: LoginScreen },
    RegisterScreen: { screen: RegisterScreen },
    CreateAccountScreen: { screen: CreateAccountScreen },
    SelectAvataScreen: { screen: SelectAvataScreen },
    InviteContactScreen: { screen: InviteContactScreen },
    EditProfileScreen: { screen: EditProfileScreen },
    PremiumProfileScreen: { screen: PremiumProfileScreen },

    CreateGroupScreen: {
      screen: CreateGroupScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },

    SelectPhotoScreen: {
      screen: SelectPhotoScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    GroupTypeScreen: {
      screen: GroupTypeScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    CreateTagScreen: {
      screen: CreateTagScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    GeoLocateGroupScreen: {
      screen: GeoLocateGroupScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    GeoLocalizeScreen: {
      screen: GeoLocalizeScreen,
      navigationOptions: {
        header: null
      }
    },
    InviteFriendToJoinGroupScreen: {
      screen: InviteFriendToJoinGroupScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    InviteFriendsIntoGroupScreen: {
      screen: InviteFriendsIntoGroupScreen,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    PrivateGroupScreen: {
      screen: PrivateGroupScreen,
      navigationOptions: {
        header: null
      }
    },

    FindFriendsScreen: {
      screen: FindFriendsScreen
    },

    FindContactsScreen: { screen: FindContactsScreen },

    SearchScreen: {
      screen: SearchScreen,
      navigationOptions: {
        header: null
      }
    },
    GroupAdmin: {
      screen: GroupAdmin,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },
    ShareOption: {
      screen: ShareOption,
      navigationOptions: {
        headerStyle: {
          elevation: 0
        },
      }
    },

  }, {
  // Default config for all screens
  // headerMode: 'none',
  initialRouteName: 'HomeScreens',
  navigationOptions: {
    headerStyle: styles.header,
  }
}
);
export default createAppContainer(PrimaryNav)

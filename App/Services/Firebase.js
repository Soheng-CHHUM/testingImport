import { Platform } from 'react-native';
import firebaseBase from 'react-native-firebase';
import { GeoFire } from 'geofire';
import RNFS from 'react-native-fs'

let instance = null

class Firebase {
  constructor() {
    if (!instance) {
      this.app = firebaseBase;

      this.app.geofire = (ref) => new GeoFire(this.app.database().ref(ref))

      if(Platform.OS == 'android') {
        this.createAndroidChannels()
      }

      this.app.auth().onAuthStateChanged(function(user) {

        if (user == null) {
            // user is not connected
        }
      });

      instance = this;
    }
    return instance
  }

  createAndroidChannels() {
    const channels = [
      new this.app.notifications.Android.Channel(
        '@bebeep-alerts',
        '@bebeep-alerts',
        this.app.notifications.Android.Importance.Max
      )
      .setDescription('Alerts notifications channel')
      .setSound(`alert.wav`)
      .setShowBadge(true)
      .enableVibration(true),
      new this.app.notifications.Android.Channel(
        '@bebeep-messages',
        '@bebeep-messages',
        this.app.notifications.Android.Importance.Max
      )
      .setShowBadge(true)
      .setDescription('Messages notifications channel')
      .enableVibration(true),
      new this.app.notifications.Android.Channel(
        '@bebeep-alerts-zone',
        '@bebeep-alerts-zone',
        this.app.notifications.Android.Importance.Max
      )
      .setDescription('Alerts zone notifications channel')
      .setSound(`alert_zone.wav`)
      .setShowBadge(true)
      .enableVibration(true),
      new this.app.notifications.Android.Channel(
        '@bebeep-alerts-pv',
        '@bebeep-alerts-pv',
        this.app.notifications.Android.Importance.Max
      )
      .setDescription('Alerts pv notifications channel')
      .setSound(`alert_pv.wav`)
      .setShowBadge(true)
      .enableVibration(true),
    ]

    channels.map((channel) => this.app.notifications().android.createChannel(channel))
  }
}

const firebaseService = new Firebase().app;

export const handleError = (error) => {

    console.error('firebase error', error);

    firebaseService.auth().signOut()
      .then(() => {
        // logout
      })
      .catch((error) => {

        // error occured during a query
      });
};

export default firebaseService;

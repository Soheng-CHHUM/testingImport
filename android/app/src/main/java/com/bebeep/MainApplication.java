package com.bebeep;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.tkporter.sendsms.SendSMSPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.rnfs.RNFSPackage;
import com.reactcommunity.rnlocalize.RNLocalizePackage;
import com.horcrux.svg.SvgPackage;
import com.smixx.fabric.FabricPackage;
import com.mapbox.rctmgl.RCTMGLPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.zmxv.RNSound.RNSoundPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.storage.RNFirebaseStoragePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.links.RNFirebaseLinksPackage;
import io.invertase.firebase.functions.RNFirebaseFunctionsPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import io.invertase.firebase.admob.RNFirebaseAdMobPackage; // <-- Add this line



import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
            new KCKeepAwakePackage(),
            SendSMSPackage.getInstance(),
        new RNFetchBlobPackage(),
        new PickerPackage(),
        new RNIapPackage(),
        new RNFSPackage(),
        new RNLocalizePackage(),
        new SvgPackage(),
        new FabricPackage(),
        new RNDeviceInfo(),
        new RNSoundPackage(),
        new LinearGradientPackage(),
        new ReactNativeAudioPackage(),
        new ReactNativeConfigPackage(),
        new RNFirebasePackage(),
        new RNFirebaseAuthPackage(),
        new RNFirebaseDatabasePackage(),
        new RNFirebaseStoragePackage(),
        new RNFirebaseMessagingPackage(),
        new RNFirebaseNotificationsPackage(),
        new RNFirebaseCrashlyticsPackage(),
        new RNFirebaseFunctionsPackage(),
        //new RNFirebaseLinksPackage(),
        new AsyncStoragePackage(),
        new VectorIconsPackage(),
        new RNGestureHandlerPackage(),
        new RCTMGLPackage(),
        new ReactNativeContacts(),
        new RNSharePackage(),
        new RNFirebaseAdMobPackage()

      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}

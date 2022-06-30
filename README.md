# weather-app

## **Prequisites**

- Node (16.13.0)
- Android Studio (4.2.0)
- XCode (12.0.1)

Follow this [guide](https://reactnative.dev/docs/environment-setup) for setting up React Native development environment.

## **Installation**

`git clone https://github.com/fmidev/weather-app.git `

`cd weather-app`

`yarn install`

### **Android**

1. Obtain Google Maps API key and place it in `.env` as depicted in `.env.default`. Guides and troubleshooting from [react-native-maps documentation](https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md#the-map-background-is-blank-google-maps)

2. Create a `keystore.properties` file in `android/` folder:

   `cd android && touch keystore.properties`

   and add placeholder content:

   ```
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=YOUR_KEY_ALIAS
   storeFile=YOUR_KEYSTORE_FILE
   ```

   Alternatively these can be provided as environment variables (e.g. in CI/CD pipeline):

   ```
   WEATHER_APP_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
   WEATHER_APP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
   WEATHER_APP_RELEASE_KEY_ALIAS=YOUR_KEY_ALIAS
   WEATHER_APP_RELEASE_STORE_FILE=YOUR_KEYSTORE_FILE
   ```

   Gradle will throw an error if one of the above is missing on `yarn android`.
   To sign the app on release builds you must create a keystore file, see [android documentation](https://developer.android.com/studio/publish/app-signing#generate-key) and change the contents of `keystore.properties` or environment variables accordingly.

## **Development**

Before running iOS or Android start metro: `yarn start`

#### **Run in development environment (Android)**

1. Open **{PROJECT_DIR}/android** in Android Studio and wait build to be completed

2. Create / open Android **virtual device** (tested with: Pixel 2, API Level 29, Android 10.0)

   - Click AVD Manager from top bar
   - Create virtual device

3. `yarn android`

#### **Run the development version on Android phone**

1. Do the above (Run in development environment (Android)) first!
2. Check all relevant instructions from React Native's own page: https://reactnative.dev/docs/running-on-device. Most importantly, install adb by either the Android Studio or Android's own instructions: https://developer.android.com/studio/releases/platform-tools. Platform tools may not be installed to PATH. The installation path can be found in Android Studio in Tools -> SDK Manager. Example path: `/Users/oksman/Library/Android/sdk`
3. Plug your device to the USB port.
4. Build the APK with Android Studio: Build -> Build Bundles(s) / APK(s) -> Build APK(s).
5. Copy the built APK to the device and install it to the device.
6. Check that your device show's in `adb`'s list of devices, for example:

```
➜  sdk ./platform-tools/adb devices
List of devices attached
R5CR207HAFP	device
```

7. Connect to the development server, for example:

```
➜  sdk ./platform-tools/adb reverse tcp:8081 tcp:8081
8081
```

8. The application should run now when opened in the device.

#### **Run in development environment (iOS)**

1. `cd ios && pod install && cd ..`

2. `npx react-native run-ios`

## **Config**

1. `cp defaultConfig.ts.example defaultConfig.ts`

2. `edit defaultConfig.ts`

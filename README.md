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

Before running iOS or Android start metro: `yarn start`. Also make sure you have a valid DefaultConfig.ts.

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

**If you have arm-based mac, do these before running:**
1. Open Project's build settings in Xcode (Project not Targets)
2. Add Any iOS Simulator SDK + "arm64" to Debug and Release under Architectures - Excluded Architectures
3. Add following lines to end of your Podfile under ios -folder:

`post_install do |installer|
  installer.pods_project.build_configurations.each do |config|
    config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
  end
end`

4. Delete VALID_ARCHS from main project's and Pods project's build settings.
5. Clean project + rebuild

If you have problems you might need to do these as well:

`rm -rf ~/Library/Developer/Xcode/DerivedData/ && pod deintegrate && pod update`

Run project:
1. `cd ios && pod install && cd ..`
2. `npx react-native run-ios`

### Troubleshooting

#### Changing Metro server port
By default, the Metro server and the application use port 8081 to communicate with each other. In some environments, the port can be reserved, which causes the application to fail with the following error message:

*"Unable to load script. Make sure you're either running Metro (run 'npx react-native start') or that your bundle 'index.android.bundle' is packaged correctly for release."*

This behaviour can be fixed by changing the port to e.g. 8080. To change the port, the following commands must be run:
- `yarn start --port 8080`
- `yarn android --port 8080` (or `npx react-native run-android --port 8080`)

## **Config**

1. `cp defaultConfig.ts.example defaultConfig.ts`

2. `edit defaultConfig.ts`

### **Units**

The units supported by the application are described on the table below.
Note that you can only use the depicted unit abbreviations.

| Parameter     | Units                             |
| ------------- | --------------------------------- |
| temperature   | 'C', 'F'                          |
| precipitation | 'mm', 'in'                        |
| wind          | 'm/s', 'km/h', 'mph', 'bft', 'kn' |
| pressure      | 'hPa', 'inHg', 'mmHg', 'mbar'     |

Table of abbreviations and their corresponding units.

| Abbreviation | Unit                  |
| ------------ | --------------------- |
| 'C'          | celsius               |
| 'F'          | fahrenheit            |
| 'mm'         | millimeter            |
| 'in'         | inch                  |
| 'm/s'        | meters per second     |
| 'km/h'       | kilometers per hour   |
| 'mph'        | miles per hour        |
| 'bft'        | beaufort              |
| 'kn'         | knot                  |
| 'hPa'        | hehtopascal           |
| 'inHg'       | inch of mercury       |
| 'mmHg'       | millimeter of mercury |
| 'mbar'       | millibar              |

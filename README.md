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

## **Development**

Before running iOS or Android start metro: `yarn start`

#### **Run in development environment (Android)**

1. Open **{PROJECT_DIR}/android** in Android Studio and wait build to be completed

2. Create / open Android **virtual device** (tested with: Pixel 2, API Level 29, Android 10.0)

   - Click AVD Manager from top bar
   - Create virtual device

3. `yarn android`

#### Run the development version in Android phone

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

2. `yarn ios`

## **Config**

1. `cp defaultConfig.ts.example defaultConfig.ts`

2. `update defaultConfig.ts`

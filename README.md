# weather-app

## **Prequisites**

- Node (12.19.0)
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

#### **Run in development environment (iOS)**

1. `cd ios && pod install && cd ..`

2. `yarn ios`

## **ENV Table**

Available default unit values are descriped in tables below. Array of used units is passed in ENV.UNITS (`UNITS=temperature,precipitation,wind,pressure`).

| UNIT_TEMPERATURE | Description |
| ---------------- | ----------- |
| 1                | Celsius     |
| 2                | Fahrenheit  |

| UNIT_PRECIPITATION | Description |
| ------------------ | ----------- |
| 1                  | Millimeter  |
| 2                  | Inch        |

| UNIT_WIND | Description |
| --------- | ----------- |
| 1         | m/s         |
| 2         | km/h        |
| 3         | mph         |
| 4         | Bft         |
| 5         | kn          |

| UNIT_PRESSURE | Description |
| ------------- | ----------- |
| 1             | hPa         |
| 2             | inHg        |
| 3             | mmHg        |
| 4             | mbar        |

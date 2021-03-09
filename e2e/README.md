# E2E testing with Detox

## Setup

### 1. Install Detox Command Line tools (`detox-cli`)

`npm install -g detox-cli`

[Official documentation of Detox.](https://github.com/wix/Detox/tree/master/docs 'Detox documentation')

### 2. Platform specific configurations

Please refer to the official getting started documentation:

- [iOS](https://github.com/wix/Detox/blob/master/docs/Introduction.iOSDevEnv.md)
- [Android](https://github.com/wix/Detox/blob/master/docs/Introduction.Android.md)

## Running E2E tests

You can either use `detox-cli` directly or run one of the following:

1. `yarn e2e:build:${PLATFORM}`
2. `yarn e2e:test:${PLATFORM}`

Replace `${PLATFORM}` with either `ios` or `android`.

Make sure to build each platform after fetching the remote or making changes before running tests again.

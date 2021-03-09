# E2E testing with Detox

## Intall Detox Command Line Tools (`detox-cli`)

`npm install -g detox-cli`

[Official documentation of Detox.](https://github.com/wix/Detox/tree/master/docs 'Detox documentation')

## Running E2E tests

You can either use `detox-cli` directly or run one of the following:

1. `yarn e2e:build:${PLATFORM}`
2. `yarn e2e:test:${PLATFORM}`

Replace `${PLATFORM}` with either `ios` or `android`.

Make sure to build each platform after fetching the remote or making changes before running tests again.

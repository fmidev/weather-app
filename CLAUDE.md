# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MobileWeather — a React Native 0.82 (bare, not Expo) cross-platform weather app for iOS and Android. TypeScript with strict mode. MIT-licensed, developed by FMI (Finnish Meteorological Institute).

## Commands

```bash
yarn install              # Install dependencies
yarn start                # Start Metro bundler (required before running the app)
yarn android              # Run on Android emulator/device
yarn ios                  # Run on iOS simulator/device (run `cd ios && pod install` first)

yarn test                 # Run Jest unit tests
yarn test path/to/file    # Run a single test file

yarn lint                 # TypeScript check (tsc --noEmit) + ESLint
yarn lint-fix             # Auto-fix ESLint violations
yarn lint:ts              # TypeScript check only
yarn lint:js              # ESLint only

yarn server               # Start mock API server (Express, port 3006)
yarn server:watch         # Start mock server with nodemon

yarn e2e:build:ios        # Build Detox e2e tests for iOS
yarn e2e:test:ios         # Run Detox e2e tests on iOS simulator
yarn e2e:build:android    # Build Detox e2e tests for Android
yarn e2e:test:android     # Run Detox e2e tests on Android emulator
```

Prerequisites: Node 20, Java JDK 17, Android Studio (Android), Xcode (iOS).

Setup requires a `defaultConfig.ts` (copy from `defaultConfig.ts.example`) and `.env` with Google Maps API key.

## Architecture

### State management

Redux with redux-thunk, no Redux Toolkit. Each domain has its own module under `src/store/<domain>/` with `actions.ts`, `reducer.ts`, `selectors.ts`, `types.ts`. Domains: forecast, observation, location, map, warnings, announcements, meteorologist, news, navigation, settings.

Persistence via redux-persist with three storage backends chosen per module:
- **AsyncStorage** — default, used by most modules
- **MMKV** (`src/store/mmkvStorage.ts`) — fast KV store for observation and news
- **SharedReduxStorage** — location data shared across contexts

Selectors use `reselect` for memoization. Action types are string constants (e.g. `FETCH_FORECAST_SUCCESS`). Reducers use switch/case.

### Network layer

Centralized axios client (`src/utils/axiosClient.ts`) with axios-cache-interceptor (2-minute in-memory TTL, 20s timeout). Domain-specific API modules in `src/network/` (WeatherApi, WarningsApi, AnnouncementsApi, NewsApi, AutocompleteApi, etc.).

### Configuration

Dynamic config system: `src/config/ConfigProvider.tsx` wraps the app in a React Context, fetches remote config on startup and refreshes every 60 seconds. Config cached in MMKV. Feature flags control warnings, news, announcements, and other optional modules.

### Navigation

React Navigation v7 with bottom-tab navigator (Weather, Map, Warnings, Others) and stack navigators per tab. Deep linking via `fmiweather://` scheme. Defined in `src/navigators/`.

### Key libraries

- **Maps**: MapLibre React Native + react-native-maps + supercluster (clustering)
- **Charts**: victory-native
- **Animation**: react-native-reanimated + moti
- **i18n**: i18next + react-i18next
- **Analytics**: Matomo tracker
- **XML parsing**: fast-xml-parser (for CAP weather warnings)
- **Dates**: moment + moment-timezone

## Path aliases

Configured in both `tsconfig.json` and `babel.config.js`:

```
@assets/*      → src/assets/*
@components/*  → src/components/*
@navigators/*  → src/navigators/*
@network/*     → src/network/*
@screens/*     → src/screens/*
@store/*        → src/store/*
@utils/*        → src/utils/*
@config        → src/config
@i18n          → i18n
```

## Lint rules to know

ESLint extends `@react-native`, `airbnb-typescript`, and `prettier`. Notable enforced rules:
- `react-native/no-inline-styles` (error)
- `react-native/no-color-literals` (error) — colors must come from theme/assets
- `react-native/no-unused-styles` (error)
- Husky pre-commit hook runs lint-staged on changed files

## Testing

Unit tests in `__tests__/` using Jest. Tests cover store reducers, config logic, and utility functions. E2e tests in `e2e/` using Detox (iOS simulator recommended — Android emulator is slow). Simulator names in `.detoxrc.json` may need adjustment for your environment.

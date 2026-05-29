# AGENTS.md
## Project overview
This is a open source React Native weather application.
The app shows weather forecasts, weather observations, warnings and weather animations.
The app aims to be an easy-to-use and reliable weather app for the general public.
The app is used by several meteorological institutes through their own forks.
Accessibility is important, because the application is provided by public authorities.

## Tech stack
- React Native
- TypeScript
- React Navigation
- MapLibre React Native and React Native Maps
  - Transition to MapLibre React Native is in progress
- react-i18next
- Moment.js
- Axios
- Redux
- Matomo analytics
- Victory Native
- Swift/SwiftUI for iOS widgets
- Java for Android widgets

The app includes custom feature flag implementation and settings are defined in defaultConfig.ts

## Backend

The app uses Smartmet Server as backend, documentation:

https://github.com/fmidev/smartmet-plugin-timeseries
https://github.com/fmidev/smartmet-plugin-wms

# Architecture

- Use `src/screens` for app screens.
- Use `src/navigators` for navigation logic.
- Use `src/components/*` for reusable components.
- Use `src/store/*` for Redux states.
- Use `src/utils` for reusable functions.
- Use `src/assets/*` for assets like themes, translations, images and icons.
- Use `src/network` for API calls.

## Development commands

Install dependencies: yarn install
Start Metro: yarn start
Run iOS: yarn ios
Run Android: yarn android`
Run tests: yarn test
Run linting: yarn lint

## Coding conventions

- Use TypeScript
- Prefer functional components.
- Prefer arrow functions.
- Reuse existing components and hooks before adding new ones.
- Follow the existing folder structure and naming conventions.
- Respect eslint rules.
- Use standard Date API instead of moment.js when possible.
- Comment code in english.
- Use async/await instead of chained promises.

## UI and Design Rules

- UI should be responsive and work both phones and tablets
- Respect platform differences between iOS and Android.

## Testing

- Create tests for new features.
- Unit tests should be placed in __tests__ directory.
- One test file for one component or ts-module.
- Don't combine tests for multiple components or modules in one test file.

# Localization

- Use react-i18next.
- Keep translation keys stable.
- Add or update translations for all supported languages when adding user-facing text.

# Accessibility

- Meet accessibility expectations for contrast, labels, and keyboard navigation.
- Use accessible components AppText.tsx for texts and ScalableIcon.tsx for icons.

# Analytics

- Track user interactions with the app.
- Use existing Matomo tracking helpers.
- Do not track personal data.
- Keep event names consistent with existing analytics conventions.

## What not to do

- Do not introduce large new dependencies without a clear reason.
- Do not rewrite existing navigation structure unnecessarily.
- Do not replace existing localization, analytics, or map infrastructure.
- Do not remove accessibility behavior without replacing it with an equivalent or better solution.

## Before committing changes

Run relevant checks when possible:

yarn lint
yarn test

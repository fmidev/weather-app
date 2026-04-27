# AGENTS.md
## Project overview
This is a open source React Native weather application built with TypeScript.
The app shows weather forecasts, weather observations, warnings and weather animations.
The app is used by several meteorological institutes through their own forks.
Accessibility is important because the application is used by public authorities.

## Tech stack
- React Native
- TypeScript
- React Navigation
- MapLibre React Native and React Native Maps (transition to MapLibre React Native is in progress)
- react-i18next
- Moment.js
- Axios
- Redux
- Matomo analytics
- Victory Native

The app includes custom feature flag implementation and settings are defined in defaultCongfig.ts
The app uses native implementation for iOS and Android widgets.

## Backend

The app uses Smartmet Server as backend, documentation:

https://github.com/fmidev/smartmet-plugin-timeseries
https://github.com/fmidev/smartmet-plugin-wms

## Development commands

Install dependencies:

`yarn install`

Start Metro:

`yarn start`

Run iOS:

`yarn ios`

Run Android:

`yarn android`

Run tests:

`yarn test`

Run linting:

`yarn lint`

## Coding conventions

* Use TypeScript
* Prefer functional components.
* Prefer arrow functions.
* Keep components small and focused.
* Reuse existing components and hooks before adding new ones.
* Follow the existing folder structure and naming conventions.
* Use clear, descriptive variable and function names.
* eslint rules should be respected.
* Use assets submodule for assets like translation files, images and themes.
* Use standard Date instead of moment.js when possible.

## React Native guidelines

* Do not introduce large new dependencies without a clear reason.
* Respect platform differences between iOS and Android.

## Testing

* Create tests for new features.
* Unit tests should be placed in __tests__ directory.
* One test file for one component or ts-module.
* Don't combine tests for multiple components or modules in one test file.

# Localization

* Use react-i18next.
* Keep translation keys stable.
* Add or update translations for all supported languages when adding user-facing text.

# Accessibility

* Take accessibility in account when adding or modifying features.
* Add meaningful accessibility labels for interactive elements.
* Use accessible components AppText.tsx for texts and ScalableIcon.tsx for icons.

# Analytics

* Track user interactions with the app.
* Use existing Matomo tracking helpers.
* Do not track personal data.
* Keep event names consistent with existing analytics conventions.

## What not to do

* Do not introduce a new global state library unless explicitly requested.
* Do not rewrite existing navigation structure unnecessarily.
* Do not replace existing localization, analytics, or map infrastructure.
* Do not remove accessibility behavior without replacing it with an equivalent or better solution.

## Before committing changes

Run relevant checks when possible:

yarn lint
yarn test

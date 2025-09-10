/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
// eslint-disable-next-line import/extensions
import App from './App';
import { name as appName } from './app.json';
import defaultConfig from './defaultConfig';

// Load only the needed moment locales

if (defaultConfig.settings.languages.includes('fi')) {
  require('moment/locale/fi');
}
if (defaultConfig.settings.languages.includes('sv')) {
  require('moment/locale/sv');
}
if (defaultConfig.settings.languages.includes('en')) {
  require('moment/locale/en-gb');
}
if (defaultConfig.settings.languages.includes('es')) {
  require('moment/locale/es');
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1.35;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.35;

AppRegistry.registerComponent(appName, () => App);

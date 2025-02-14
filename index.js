/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
// eslint-disable-next-line import/extensions
import App from './App';
import { name as appName } from './app.json';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1.35;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.35;

AppRegistry.registerComponent(appName, () => App);

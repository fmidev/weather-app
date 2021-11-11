/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
// eslint-disable-next-line import/extensions, import/no-unresolved
import App from './App';
import { name as appName } from './app.json';

// disable font scaling for MVP
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

AppRegistry.registerComponent(appName, () => App);

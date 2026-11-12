import './weatherScreenNativeMocks';

// WebView and the CAP map are native surfaces; the live-test warnings components and
// HTTP transport remain real. Jest does not execute the embedded map client.
jest.mock('react-native-webview', () => ({
  WebView: require('react-native').View,
}));

jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: require('react-native').View,
  Geojson: require('react-native').View,
}));

jest.mock('@maplibre/maplibre-react-native', () => ({
  LogManager: { onLog: jest.fn(), start: jest.fn() },
}));

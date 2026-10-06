import './weatherScreenNativeMocks';

// SearchScreen uses real map actions; only MapLibre's native logger is replaced.
jest.mock('@maplibre/maplibre-react-native', () => ({
  LogManager: { onLog: jest.fn(), start: jest.fn() },
}));

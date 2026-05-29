import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import LayerSelector from '../../src/components/map/ui/LayerSelector';

const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlay);
const mockSelectMapLayers = jest.fn((state: any) => state.mock.mapLayers);
const mockUpdateActiveOverlay = jest.fn((id: number) => ({
  type: 'MAP/UPDATE_ACTIVE_OVERLAY',
  payload: id,
}));
const mockTrackMatomoEvent = jest.fn();
const mockConfigGet = jest.fn();
const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: (state: any) => mockSelectActiveOverlay(state),
  selectMapLayers: (state: any) => mockSelectMapLayers(state),
}));

jest.mock('@store/map/actions', () => ({
  updateActiveOverlay: (id: number) => mockUpdateActiveOverlay(id),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#333333',
      primary: '#0062cc',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'map:layersBottomSheet:notSelected') return 'not selected';
      if (key === 'map:layersBottomSheet:selectLayerAccessibilityHint') {
        return 'Select layer';
      }
      return key;
    },
    i18n: {
      language: 'en',
    },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('LayerSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          layers: [
            { id: 1, name: { en: 'Radar' } },
            { id: 2, name: { en: 'Clouds' } },
          ],
        };
      }
      return {};
    });
  });

  it('renders layers with selected state and icons', () => {
    const store = createStore({
      mock: {
        activeOverlay: 1,
        mapLayers: {},
      },
    });

    const { getByText, getByA11yLabel } = render(
      <Provider store={store as any}>
        <LayerSelector onClose={() => {}} />
      </Provider>
    );

    expect(getByText('Radar')).toBeTruthy();
    expect(getByText('Clouds')).toBeTruthy();
    expect(getByA11yLabel('Radar').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByA11yLabel('Clouds, not selected').props.accessibilityHint).toBe(
      'Select layer'
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'radio-button-on',
        style: { color: '#0062cc' },
      })
    );
  });

  it('selects a new layer, tracks event and closes', () => {
    const store = createStore({
      mock: {
        activeOverlay: 1,
        mapLayers: {},
      },
    });
    const onClose = jest.fn();

    const { getByA11yLabel } = render(
      <Provider store={store as any}>
        <LayerSelector onClose={onClose} />
      </Provider>
    );

    fireEvent.press(getByA11yLabel('Clouds, not selected'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Layer selected - Clouds'
    );
    expect(mockUpdateActiveOverlay).toHaveBeenCalledWith(2);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_ACTIVE_OVERLAY',
      payload: 2,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

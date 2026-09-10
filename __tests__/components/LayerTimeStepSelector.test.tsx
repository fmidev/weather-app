import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import LayerTimeStepSelector from '../../src/components/map/ui/LayerTimeStepSelector';

const mockSelectActiveOverlay = jest.fn(
  (state: any) => state.mock.activeOverlay
);
const mockUpdateActiveOverlay = jest.fn((id: number) => ({
  type: 'MAP/UPDATE_ACTIVE_OVERLAY',
  payload: id,
}));
const mockTrackMatomoEvent = jest.fn();
const mockConfigGet = jest.fn();
let mockIsDark = false;

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: (state: any) => mockSelectActiveOverlay(state),
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
    dark: mockIsDark,
    colors: {
      primary: mockIsDark ? '#fefefe' : '#0062cc',
      mapButtonBackground: mockIsDark ? '#202020' : '#ffffff',
      mapButtonBorder: '#cccccc',
      hourListText: mockIsDark ? '#f5f5f5' : '#222222',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 4 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options: { count: number }) => {
      if (key === 'map:timeStepSelector:minutesAccessibilityLabel') {
        return `${options.count} minute time step`;
      }
      if (key === 'map:timeStepSelector:selectAccessibilityHint') {
        return 'Select time step';
      }
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const mapConfig = {
  layerGroups: [
    { id: 1, name: { en: 'Rain' }, layers: [3, 2, 1] },
  ],
  layers: [
    {
      id: 1,
      timeButton: {
        en: { label: '5 min', accessibilityLabel: 'Five minute interval' },
      },
      times: { timeStep: 5 },
    },
    {
      id: 2,
      name: { en: 'Quarter-hour layer name' },
      timeButton: {
        en: { label: '15 min', accessibilityLabel: 'Fifteen minute interval' },
      },
      times: { timeStep: 15 },
    },
    {
      id: 3,
      timeButton: {
        en: { label: '60 min', accessibilityLabel: 'Sixty minute interval' },
      },
      times: { timeStep: 60 },
    },
    { id: 8, times: { timeStep: 60 } },
  ],
};

describe('LayerTimeStepSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDark = false;
    mockConfigGet.mockReturnValue(mapConfig);
  });

  it('renders the active group time steps and selects another layer', () => {
    const store = createStore({ mock: { activeOverlay: 2 } });
    const {
      getAllByA11yRole,
      getByText,
      getByA11yLabel,
      getByTestId,
    } = render(
      <Provider store={store as any}>
        <LayerTimeStepSelector />
      </Provider>
    );

    expect(getByText('5 min')).toBeTruthy();
    expect(getByText('15 min')).toBeTruthy();
    expect(getByText('60 min')).toBeTruthy();
    const buttons = getAllByA11yRole('button');
    expect(buttons.map((button) => button.props.accessibilityLabel)).toEqual([
      'Five minute interval',
      'Fifteen minute interval',
      'Sixty minute interval',
    ]);
    expect(buttons[0].props.style).toEqual(
      expect.objectContaining({ marginLeft: 0 })
    );
    const selector = getByTestId('map_layer_time_step_selector');
    expect(selector.props.pointerEvents).toBe('box-none');
    expect(selector.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ left: 16 })])
    );
    expect(selector.props.style).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ right: expect.anything() })])
    );
    expect(getByText('15 min').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#0062cc' })])
    );
    expect(getByA11yLabel('Fifteen minute interval').props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#ffffff',
        borderColor: '#0062cc',
        borderWidth: 2,
      })
    );
    expect(
      getByA11yLabel('Fifteen minute interval').props.accessibilityState
    ).toEqual({ selected: true });

    fireEvent.press(getByA11yLabel('Sixty minute interval'));

    expect(mockUpdateActiveOverlay).toHaveBeenCalledWith(3);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_ACTIVE_OVERLAY',
      payload: 3,
    });
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Layer 3 time step 60 selected'
    );
  });

  it('uses a dark background and light border for the dark theme selection', () => {
    mockIsDark = true;
    const store = createStore({ mock: { activeOverlay: 2 } });
    const { getByA11yLabel, getByText } = render(
      <Provider store={store as any}>
        <LayerTimeStepSelector />
      </Provider>
    );

    expect(getByA11yLabel('Fifteen minute interval').props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#202020',
        borderColor: '#fefefe',
        borderWidth: 2,
      })
    );
    expect(getByText('15 min').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#fefefe' })])
    );
  });

  it('does not render for a layer outside the configured groups', () => {
    const store = createStore({ mock: { activeOverlay: 8 } });
    const { toJSON } = render(
      <Provider store={store as any}>
        <LayerTimeStepSelector />
      </Provider>
    );

    expect(toJSON()).toBeNull();
  });
});

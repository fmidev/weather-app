import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import SpeedSelector from '../../src/components/map/ui/SpeedSelector';

const mockIcon = jest.fn((props) => <Text {...props} testID={`icon-${props.name}`}>icon</Text>);
const mockTrackMatomoEvent = jest.fn();
const mockSelectAnimationSpeed = jest.fn((state: any) => state.mock.animationSpeed);
const mockUpdateAnimationSpeed = jest.fn((value: number) => ({
  type: 'MAP/UPDATE_ANIMATION_SPEED',
  payload: value,
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#d9d9d9',
      hourListText: '#222222',
      primary: '#0062cc',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'map:layersBottomSheet:Slow') return 'Slow';
      if (key === 'map:layersBottomSheet:Normal') return 'Normal';
      if (key === 'map:layersBottomSheet:Fast') return 'Fast';
      if (key === 'map:layersBottomSheet:selectSpeedAccessibilityHint') {
        return 'Select animation speed';
      }
      return key;
    },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@store/map/selectors', () => ({
  selectAnimationSpeed: (state: any) => mockSelectAnimationSpeed(state),
}));

jest.mock('@store/map/actions', () => ({
  updateAnimationSpeed: (value: number) => mockUpdateAnimationSpeed(value),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('SpeedSelector', () => {
  beforeEach(() => {
    mockIcon.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockSelectAnimationSpeed.mockClear();
    mockUpdateAnimationSpeed.mockClear();
  });

  it('renders all speed options and selected state from redux', () => {
    const store = createStore({ mock: { animationSpeed: 50 } });
    const { getByText, getByA11yLabel, toJSON } = render(
      <Provider store={store as any}>
        <SpeedSelector />
      </Provider>
    );

    expect(getByText('Slow')).toBeTruthy();
    expect(getByText('Normal')).toBeTruthy();
    expect(getByText('Fast')).toBeTruthy();

    expect(getByA11yLabel('Slow').props.accessibilityState).toEqual({ selected: false });
    expect(getByA11yLabel('Normal').props.accessibilityState).toEqual({ selected: true });
    expect(getByA11yLabel('Fast').props.accessibilityState).toEqual({ selected: false });

    expect(getByA11yLabel('Slow').props.accessibilityHint).toBe('Select animation speed');
    expect(getByA11yLabel('Normal').props.accessibilityHint).toBe('');

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'radio-button-on',
        style: { color: '#0062cc' },
      })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'radio-button-off',
      })
    );

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);
    expect(mergedStyle.borderBottomColor).toBe('#d9d9d9');
  });

  it('does not dispatch or track event when pressing already selected speed', () => {
    const store = createStore({ mock: { animationSpeed: 50 } });
    const { getByA11yLabel } = render(
      <Provider store={store as any}>
        <SpeedSelector />
      </Provider>
    );

    fireEvent.press(getByA11yLabel('Normal'));

    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    expect(mockUpdateAnimationSpeed).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('tracks matomo event and dispatches update when selecting another speed', () => {
    const store = createStore({ mock: { animationSpeed: 50 } });
    const { getByA11yLabel } = render(
      <Provider store={store as any}>
        <SpeedSelector />
      </Provider>
    );

    fireEvent.press(getByA11yLabel('Fast'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Animation speed Fast selected'
    );
    expect(mockUpdateAnimationSpeed).toHaveBeenCalledWith(30);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_ANIMATION_SPEED',
      payload: 30,
    });
  });
});

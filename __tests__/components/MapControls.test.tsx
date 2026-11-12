import React from 'react';
import { Platform } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ScreenHeaderItemsContext } from '../../src/navigators/ScreenHeaderItemsContext';
import MapControls from '../../src/components/map/ui/MapControls';

const mockUseOrientation = jest.fn();
const mockUsesVerticalBarLayout = jest.fn();
const mockSetHeaderItems = jest.fn();
const HeaderItemsProvider = ({ children }: React.PropsWithChildren) => (
  <ScreenHeaderItemsContext.Provider value={mockSetHeaderItems}>
    {children}
  </ScreenHeaderItemsContext.Provider>
);
const renderControls = (ui: React.ReactElement) => render(ui, { wrapper: HeaderItemsProvider });

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@config', () => ({
  Config: {
    get: (key: string) => {
      if (key === 'announcements') {
        return { enabled: true };
      }
      return {};
    },
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 6,
    bottom: 0,
    left: 4,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@utils/hooks', () => ({
  ...jest.requireActual('@utils/hooks'),
  useOrientation: () => mockUseOrientation(),
  usesVerticalBarLayout: () => mockUsesVerticalBarLayout(),
}));

jest.mock('../../src/components/map/ui/MapButton', () => ({
  __esModule: true,
  default: ({ testID, accessibilityLabel, onPress, icon }: any) => {
    const { Text: MockText } = require('react-native');
    return (
      <MockText
        testID={testID ?? `map-button-${icon}`}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}>
        {icon}
      </MockText>
    );
  },
}));

jest.mock('../../src/components/map/ui/RelocateButton', () => ({
  __esModule: true,
  default: ({ onPress }: any) => {
    const { Text: MockText } = require('react-native');
    return (
      <MockText testID="relocate-button" onPress={onPress}>
        relocate
      </MockText>
    );
  },
}));

jest.mock('../../src/components/map/ui/TimeSlider', () => ({
  __esModule: true,
  default: () => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="time-slider">slider</MockText>;
  },
}));

jest.mock('../../src/components/map/ui/LayerTimeStepSelector', () => ({
  __esModule: true,
  default: () => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="layer-time-step-selector">time steps</MockText>;
  },
}));

describe('MapControls', () => {
  beforeEach(() => {
    mockUseOrientation.mockReset();
    mockUsesVerticalBarLayout.mockReturnValue(false);
    mockSetHeaderItems.mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders all buttons, slider and relocate button when enabled', () => {
    mockUseOrientation.mockReturnValue(false);
    const handlers = {
      onLayersPressed: jest.fn(),
      onInfoPressed: jest.fn(),
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      relocate: jest.fn(),
    };

    const { getByTestId, getByA11yLabel } = renderControls(
      <MapControls {...handlers} showRelocateButton />
    );

    fireEvent.press(getByTestId('relocate-button'));
    fireEvent.press(getByA11yLabel('map:plusButtonAccessibilityLabel'));
    fireEvent.press(getByA11yLabel('map:minusButtonAccessibilityLabel'));
    fireEvent.press(getByTestId('map_info_button'));
    fireEvent.press(getByTestId('map_layers_button'));

    expect(getByTestId('time-slider')).toBeTruthy();
    expect(getByTestId('layer-time-step-selector')).toBeTruthy();
    expect(handlers.relocate).toHaveBeenCalledTimes(1);
    expect(handlers.onZoomIn).toHaveBeenCalledTimes(1);
    expect(handlers.onZoomOut).toHaveBeenCalledTimes(1);
    expect(handlers.onInfoPressed).toHaveBeenCalledTimes(1);
    expect(handlers.onLayersPressed).toHaveBeenCalledTimes(1);
  });

  it('hides relocate button when not needed', () => {
    mockUseOrientation.mockReturnValue(true);

    const { queryByTestId } = renderControls(
      <MapControls
        onLayersPressed={() => {}}
        onInfoPressed={() => {}}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        relocate={() => {}}
        showRelocateButton={false}
      />
    );

    expect(queryByTestId('relocate-button')).toBeNull();
  });

  it('hides duplicate map buttons only while the vertical bar layout is active', () => {
    const props = {
      onLayersPressed: jest.fn(),
      onInfoPressed: jest.fn(),
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      relocate: jest.fn(),
      showRelocateButton: true,
    };
    const view = renderControls(<MapControls {...props} />);
    expect(view.getByTestId('map_info_button')).toBeTruthy();
    expect(
      mockSetHeaderItems.mock.calls.at(-1)![0]
    ).toEqual([]);

    mockUsesVerticalBarLayout.mockReturnValue(true);
    view.rerender(<MapControls {...props} />);
    expect(view.queryByTestId('map-button-plus')).toBeNull();
    expect(view.queryByTestId('map-button-minus')).toBeNull();
    expect(view.queryByTestId('map_info_button')).toBeNull();
    expect(view.queryByTestId('map_layers_button')).toBeNull();
    expect(view.getByTestId('relocate-button')).toBeTruthy();
    expect(view.getByTestId('time-slider')).toBeTruthy();
    expect(view.getByTestId('layer-time-step-selector')).toBeTruthy();
    expect(
      mockSetHeaderItems.mock.calls
        .at(-1)![0]
    ).toHaveLength(4);

    mockUsesVerticalBarLayout.mockReturnValue(false);
    view.rerender(<MapControls {...props} />);
    expect(view.getByTestId('map-button-plus')).toBeTruthy();
    expect(view.getByTestId('map-button-minus')).toBeTruthy();
    expect(view.getByTestId('map_info_button')).toBeTruthy();
    expect(view.getByTestId('map_layers_button')).toBeTruthy();
    expect(
      mockSetHeaderItems.mock.calls.at(-1)![0]
    ).toEqual([]);
  });

  it('registers native zoom, info and layer buttons with the existing map handlers on iOS', () => {
    mockUsesVerticalBarLayout.mockReturnValue(true);
    const handlers = {
      onLayersPressed: jest.fn(),
      onInfoPressed: jest.fn(),
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      relocate: jest.fn(),
    };
    const view = renderControls(
      <MapControls {...handlers} showRelocateButton={false} />
    );
    const items = mockSetHeaderItems.mock.calls
      .at(-1)![0];
    expect(
      items.map(({ type, icon, accessibilityLabel }: any) => ({
        type,
        icon,
        accessibilityLabel,
      }))
    ).toEqual([
      {
        type: 'button',
        icon: { type: 'sfSymbol', name: 'plus' },
        accessibilityLabel: 'map:plusButtonAccessibilityLabel',
      },
      {
        type: 'button',
        icon: { type: 'sfSymbol', name: 'minus' },
        accessibilityLabel: 'map:minusButtonAccessibilityLabel',
      },
      {
        type: 'button',
        icon: { type: 'sfSymbol', name: 'info.circle' },
        accessibilityLabel: 'map:infoButtonAccessibilityLabel',
      },
      {
        type: 'button',
        icon: { type: 'sfSymbol', name: 'square.3.layers.3d' },
        accessibilityLabel: 'map:layersButtonAccessibilityLabel',
      },
    ]);
    act(() => items.forEach(({ onPress }: any) => onPress()));
    expect(handlers.onZoomIn).toHaveBeenCalledTimes(1);
    expect(handlers.onZoomOut).toHaveBeenCalledTimes(1);
    expect(handlers.onInfoPressed).toHaveBeenCalledTimes(1);
    expect(handlers.onLayersPressed).toHaveBeenCalledTimes(1);

    const nextZoomIn = jest.fn();
    view.rerender(
      <MapControls
        {...handlers}
        onZoomIn={nextZoomIn}
        showRelocateButton={false}
      />
    );
    const updated = mockSetHeaderItems.mock.calls
      .at(-1)![0];
    act(() => updated[0].onPress());
    expect(nextZoomIn).toHaveBeenCalledTimes(1);
    expect(handlers.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('keeps Android controls without registering native header items', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const { getByTestId } = renderControls(
      <MapControls
        onLayersPressed={jest.fn()}
        onInfoPressed={jest.fn()}
        onZoomIn={jest.fn()}
        onZoomOut={jest.fn()}
        relocate={jest.fn()}
        showRelocateButton={false}
      />
    );
    expect(mockSetHeaderItems).not.toHaveBeenCalled();
    expect(getByTestId('map_info_button')).toBeTruthy();
    expect(getByTestId('map_layers_button')).toBeTruthy();
  });
});

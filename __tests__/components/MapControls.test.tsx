import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import MapControls from '../../src/components/map/ui/MapControls';

const mockUseOrientation = jest.fn();

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
  useOrientation: () => mockUseOrientation(),
}));

jest.mock('../../src/components/map/ui/MapButton', () => ({
  __esModule: true,
  default: ({ testID, accessibilityLabel, onPress, icon }: any) => {
    const { Text: MockText } = require('react-native');
    return (
      <MockText
        testID={testID ?? `map-button-${icon}`}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
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

describe('MapControls', () => {
  beforeEach(() => {
    mockUseOrientation.mockReset();
  });

  it('renders all buttons, slider and relocate button when enabled', () => {
    mockUseOrientation.mockReturnValue(false);
    const handlers = {
      onLayersPressed: jest.fn(),
      onInfoPressed: jest.fn(),
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      relocate: jest.fn(),
    };

    const { getByTestId, getByA11yLabel } = render(
      <MapControls
        {...handlers}
        showRelocateButton
      />
    );

    fireEvent.press(getByTestId('relocate-button'));
    fireEvent.press(getByA11yLabel('map:plusButtonAccessibilityLabel'));
    fireEvent.press(getByA11yLabel('map:minusButtonAccessibilityLabel'));
    fireEvent.press(getByTestId('map_info_button'));
    fireEvent.press(getByTestId('map_layers_button'));

    expect(getByTestId('time-slider')).toBeTruthy();
    expect(handlers.relocate).toHaveBeenCalledTimes(1);
    expect(handlers.onZoomIn).toHaveBeenCalledTimes(1);
    expect(handlers.onZoomOut).toHaveBeenCalledTimes(1);
    expect(handlers.onInfoPressed).toHaveBeenCalledTimes(1);
    expect(handlers.onLayersPressed).toHaveBeenCalledTimes(1);
  });

  it('hides relocate button when not needed', () => {
    mockUseOrientation.mockReturnValue(true);

    const { queryByTestId } = render(
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
});

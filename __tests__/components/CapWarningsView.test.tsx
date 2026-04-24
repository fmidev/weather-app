import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import CapWarningsView from '../../src/components/warnings/cap/CapWarningsView';

const mockConfigGet = jest.fn();
const mockSheetOpen = jest.fn();
const mockSheetClose = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/location/selector', () => ({
  selectCurrent: jest.fn(),
}));

jest.mock('@store/warnings/selectors', () => ({
  selectCapWarningData: jest.fn(),
  selectFetchSuccessTime: jest.fn(),
  selectLoading: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      hourListText: '#333333',
      primaryText: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'warningsForNDays') return `${options.days} day warnings`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  const wrappedMoment = (...args: any[]) => actualMoment(...args);
  Object.assign(wrappedMoment, actualMoment);
  return wrappedMoment;
});

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');

  return ReactLib.forwardRef(({ children }: any, ref: any) => {
    ReactLib.useImperativeHandle(ref, () => ({
      open: mockSheetOpen,
      close: mockSheetClose,
    }));
    return <View testID="legend-sheet">{children}</View>;
  });
});

jest.mock('../../src/components/common/PanelHeader', () => ({
  __esModule: true,
  default: ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('../../src/components/warnings/cap/CapWarningsLegend', () => ({
  __esModule: true,
  default: ({ onClose }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="legend-close" onPress={onClose}>
        <Text>legend</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/warnings/cap/MapView', () => ({
  __esModule: true,
  default: ({ dates, capData }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID="cap-map-view">{`${dates.length}-${capData?.length ?? 0}`}</Text>
    );
  },
}));

jest.mock('../../src/components/warnings/cap/TextList', () => ({
  __esModule: true,
  default: ({ dates, capData }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID="cap-text-list">{`${dates.length}-${capData?.length ?? 0}`}</Text>
    );
  },
}));

jest.mock('../../src/components/warnings/cap/LocalWarningsBar', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="local-warnings-bar">local</Text>;
  },
}));

describe('CapWarningsView', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockSheetOpen.mockClear();
    mockSheetClose.mockClear();
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return {
          capViewSettings: {
            numberOfDays: 3,
            includeAreaInTitle: true,
            localWarningsEnabled: true,
            localWarningsAfterCountry: false,
          },
        };
      }
      if (key === 'location') {
        return {
          default: {
            country: 'FI',
          },
        };
      }
      return {};
    });
  });

  it('renders cap content and opens legend sheet from info button', () => {
    const { getByLabelText, getByTestId, getAllByTestId, getByText } = render(
      <CapWarningsView
        loading={false}
        updated="2024-01-02T12:00:00Z"
        currentLocation={{ name: 'Helsinki', country: 'FI' } as any}
        capWarnings={[{ identifier: '1' } as any]}
      />
    );

    expect(getAllByTestId('local-warnings-bar')).toHaveLength(1);
    expect(getByTestId('cap-map-view').props.children).toBe('3-1');
    expect(getByTestId('cap-text-list').props.children).toBe('3-1');
    expect(getByText('3 day warnings - Helsinki')).toBeTruthy();

    fireEvent.press(getByLabelText('infoAccessibilityLabel'));
    expect(mockSheetOpen).toHaveBeenCalled();

    fireEvent.press(getByTestId('legend-close'));
    expect(mockSheetClose).toHaveBeenCalled();
  });

  it('renders local warnings bar after country section when configured', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return {
          capViewSettings: {
            numberOfDays: 2,
            localWarningsEnabled: true,
            localWarningsAfterCountry: true,
          },
        };
      }
      if (key === 'location') {
        return {
          default: {
            country: 'FI',
          },
        };
      }
      return {};
    });

    const { getAllByTestId } = render(
      <CapWarningsView
        loading={false}
        updated="2024-01-02T12:00:00Z"
        currentLocation={{ name: 'Espoo', country: 'FI' } as any}
        capWarnings={[]}
      />
    );

    expect(getAllByTestId('local-warnings-bar')).toHaveLength(1);
  });
});

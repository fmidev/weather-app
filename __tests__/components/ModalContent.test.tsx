import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ModalContent from '../../src/components/weather/forecast/ModalContent';

const mockTrackMatomoEvent = jest.fn();
const mockModalForecast = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#111111',
    },
  }),
}));

jest.mock('@utils/helpers', () => ({
  uppercaseFirst: (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name, onPress, accessibilityLabel }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || name}>
        <Text testID={`icon-${name}`}>{name}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: ({ onPress, testID, accessibilityLabel }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}>
        <Text>close</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/weather/forecast/ModalForecast', () => ({
  __esModule: true,
  default: ({
    data,
    initialPosition,
    maxHeight,
    onScrollOffsetChange,
    onScrollOffsetMaxChange,
  }: any) => {
    mockModalForecast({
      data,
      initialPosition,
      maxHeight,
      onScrollOffsetChange,
      onScrollOffsetMaxChange,
    });
    const { Text } = require('react-native');
    return <Text testID="modal-forecast">{`${data.length}-${initialPosition}`}</Text>;
  },
}));

describe('ModalContent', () => {
  beforeEach(() => {
    mockTrackMatomoEvent.mockClear();
    mockModalForecast.mockClear();
  });

  it('renders modal header, selected day forecast and handles prev next close', () => {
    const onClose = jest.fn();
    const onDayChange = jest.fn();
    const timeStamp = new Date('2035-03-03T12:00:00Z').getTime();

    const { getByLabelText, getByTestId } = render(
      <ModalContent
        data={{ '3.3.': [{ epochtime: 1 }] } as any}
        activeDayIndex={1}
        timeStamp={timeStamp}
        onClose={onClose}
        onDayChange={onDayChange}
        initialPosition="start"
      />
    );

    fireEvent.press(getByLabelText('previousDay'));
    fireEvent.press(getByLabelText('nextDay'));
    fireEvent.press(getByTestId('forecast_modal_close_button'));

    expect(onDayChange).toHaveBeenCalledWith(false);
    expect(onDayChange).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Modal PREV day'
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Modal NEXT day'
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Modal close X'
    );
    expect(mockModalForecast).toHaveBeenCalledWith({
      data: [{ epochtime: 1 }],
      initialPosition: 'start',
      maxHeight: undefined,
      onScrollOffsetChange: undefined,
      onScrollOffsetMaxChange: undefined,
    });
    expect(getByTestId('modal-forecast')).toBeTruthy();
  });

  it('does not render previous day action for the first day', () => {
    const timeStamp = new Date('2035-03-03T12:00:00Z').getTime();

    const { getByLabelText, queryByLabelText } = render(
      <ModalContent
        data={{ '3.3.': [{ epochtime: 1 }] } as any}
        activeDayIndex={0}
        timeStamp={timeStamp}
        onClose={jest.fn()}
        onDayChange={jest.fn()}
        initialPosition="end"
      />
    );

    expect(queryByLabelText('previousDay')).toBeNull();
    expect(getByLabelText('nextDay')).toBeTruthy();
    expect(mockModalForecast).toHaveBeenCalledWith({
      data: [{ epochtime: 1 }],
      initialPosition: 'end',
      maxHeight: undefined,
      onScrollOffsetChange: undefined,
      onScrollOffsetMaxChange: undefined,
    });
  });

  it('passes an empty list to ModalForecast when forecast data is missing', () => {
    const timeStamp = new Date('2035-03-03T12:00:00Z').getTime();

    const { getByTestId } = render(
      <ModalContent
        data={undefined as any}
        activeDayIndex={1}
        timeStamp={timeStamp}
        onClose={jest.fn()}
        onDayChange={jest.fn()}
        initialPosition="start"
      />
    );

    expect(getByTestId('modal-forecast').props.children).toBe('0-start');
    expect(mockModalForecast).toHaveBeenCalledWith({
      data: [],
      initialPosition: 'start',
      maxHeight: undefined,
      onScrollOffsetChange: undefined,
      onScrollOffsetMaxChange: undefined,
    });
  });
});

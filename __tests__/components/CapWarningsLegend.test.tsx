import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import CapWarningsLegend from '../../src/components/warnings/cap/CapWarningsLegend';

const mockCloseButton = jest.fn((props) => {
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity onPress={props.onPress} accessibilityLabel={props.accessibilityLabel}>
      <Text testID="close-button">close</Text>
    </TouchableOpacity>
  );
});

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#111111',
      hourListText: '#333333',
    },
  }),
}));

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: (props: any) => mockCloseButton(props),
}));

jest.mock('../../src/components/warnings/cap/CapSeverityBar', () => ({
  __esModule: true,
  default: ({ severities }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`severity-${severities.join('-')}`}>bar</Text>;
  },
}));

jest.mock('../../src/components/warnings/TypeColorRow', () => ({
  __esModule: true,
  default: ({ severity }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`type-color-row-${severity}`}>{severity}</Text>;
  },
}));

describe('CapWarningsLegend', () => {
  it('renders legend content and closes from close button', () => {
    const onClose = jest.fn();
    const { getByText, getByTestId } = render(
      <CapWarningsLegend onClose={onClose} />
    );

    expect(getByText('warnings:capInfo:dailyTitle')).toBeTruthy();
    expect(getByText('warnings:capInfo:warningColorsExplanation')).toBeTruthy();
    expect(getByTestId('severity-0-0-0-0')).toBeTruthy();
    expect(getByTestId('severity-1-1-2-3')).toBeTruthy();
    expect(getByTestId('type-color-row-0')).toBeTruthy();
    expect(getByTestId('type-color-row-3')).toBeTruthy();

    fireEvent.press(getByTestId('close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

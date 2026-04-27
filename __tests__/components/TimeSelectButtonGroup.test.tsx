import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TimeSelectButtonGroup from '../../src/components/weather/forecast/TimeSelectButtonGroup';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'at' ? 'At' : key),
  }),
}));

jest.mock('@components/common/HourSelectorButton', () => ({
  __esModule: true,
  default: ({ text, onPress, disabled, active, accessibilityHint }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, selected: active }}
        onPress={disabled ? undefined : onPress}>
        <Text>{text}</Text>
      </Pressable>
    );
  },
}));

describe('TimeSelectButtonGroup', () => {
  it('calls onTimeSelect with bounded hour', () => {
    const onTimeSelect = jest.fn();
    const { getByLabelText } = render(
      <TimeSelectButtonGroup
        startHour={3}
        endHour={16}
        selectedHour={6}
        onTimeSelect={onTimeSelect}
      />
    );

    fireEvent.press(getByLabelText('06-11'));
    expect(onTimeSelect).toHaveBeenCalledWith(6);
  });
});

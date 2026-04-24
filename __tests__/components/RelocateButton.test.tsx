import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import RelocateButton from '../../src/components/map/ui/RelocateButton';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      shadow: '#222222',
      background: '#f8f8f8',
      primaryText: '#101010',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'map:relocateButtonAccessibilityLabel') {
        return 'Relocate map to my location';
      }
      if (key === 'map:relocateButtonText') {
        return 'Relocate';
      }
      return key;
    },
  }),
}));

describe('RelocateButton', () => {
  it('renders translated label, uses themed styles and handles press', () => {
    const onPress = jest.fn();
    const { getByText, getByA11yLabel, toJSON } = render(
      // eslint-disable-next-line react-native/no-inline-styles
      <RelocateButton onPress={onPress} style={{ marginTop: 10 }} />
    );

    expect(getByText('Relocate')).toBeTruthy();

    fireEvent.press(getByA11yLabel('Relocate map to my location'));
    expect(onPress).toHaveBeenCalledTimes(1);

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.marginTop).toBe(10);
    expect(mergedStyle.backgroundColor).toBe('#f8f8f8');
    expect(mergedStyle.borderColor).toBe('#101010');
    expect(mergedStyle.shadowColor).toBe('#222222');
  });
});

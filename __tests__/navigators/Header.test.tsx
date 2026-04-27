import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import {
  LocationHeaderLeft,
  LocationHeaderRight,
  LocationHeaderTitle,
} from '../../src/navigators/Header';

const mockHeaderButton = jest.fn();
const mockCommonHeaderTitle = jest.fn();

jest.mock('@components/common/HeaderButton', () => ({
  __esModule: true,
  default: (props: any) => {
    mockHeaderButton(props);
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID={props.testID || `header-button-${props.icon}`}
        accessibilityLabel={props.accessibilityLabel}
        accessibilityHint={props.accessibilityHint}
        onPress={props.onPress}>
        <Text>{props.title || props.icon}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@components/common/CommonHeaderTitle', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCommonHeaderTitle(props);
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="common-header-title" onPress={props.onPress}>
        <Text>title</Text>
      </Pressable>
    );
  },
}));

const t = (key: string) => key;

describe('navigator Header helpers', () => {
  beforeEach(() => {
    mockHeaderButton.mockClear();
    mockCommonHeaderTitle.mockClear();
  });

  it('renders locate header button with translated labels', () => {
    const onPress = jest.fn();
    const view = render(<LocationHeaderLeft t={t} onPress={onPress} />);

    fireEvent.press(view.getByTestId('header-button-locate'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockHeaderButton).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'navigation:locate',
        accessibilityLabel: 'navigation:locate',
        accessibilityHint: 'navigation:locateAccessibilityLabel',
        icon: 'locate',
      })
    );
  });

  it('renders clickable location title', () => {
    const onPress = jest.fn();
    const view = render(<LocationHeaderTitle onPress={onPress} />);

    fireEvent.press(view.getByTestId('common-header-title'));

    expect(mockCommonHeaderTitle).toHaveBeenCalledWith(
      expect.objectContaining({ onPress })
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders search header button on the right', () => {
    const onPress = jest.fn();
    const view = render(<LocationHeaderRight t={t} onPress={onPress} />);

    fireEvent.press(view.getByTestId('search_header_button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockHeaderButton).toHaveBeenCalledWith(
      expect.objectContaining({
        testID: 'search_header_button',
        title: 'navigation:search',
        accessibilityLabel: 'navigation:search',
        accessibilityHint: 'navigation:searchAccessibilityLabel',
        icon: 'search',
        right: true,
      })
    );
  });
});

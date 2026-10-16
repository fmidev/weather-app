import React from 'react';
import { View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import AccessibleView from '../../src/components/common/AccessibleView';

describe('AccessibleView', () => {
  it('forwards the accessibility properties, children and layout handler', () => {
    const onLayout = jest.fn();
    const view = render(
      <AccessibleView
        testID="header"
        accessibilityRole="header"
        accessibilityLabel="Asetukset"
        accessibilityHint="Vaihda asetuksia"
        onLayout={onLayout}>
        <View testID="child" />
      </AccessibleView>
    );

    expect(view.getByTestId('header').props.accessibilityRole).toBe('header');
    expect(view.getByTestId('header').props.accessibilityLabel).toBe(
      'Asetukset'
    );
    expect(view.getByTestId('header').props.accessibilityHint).toBe(
      'Vaihda asetuksia'
    );
    expect(view.getByTestId('child')).toBeTruthy();
    fireEvent(view.getByTestId('header'), 'layout', {});
    expect(onLayout).toHaveBeenCalledWith({});
  });
});

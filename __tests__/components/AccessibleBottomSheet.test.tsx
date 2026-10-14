import React, { createRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Modal, TouchableOpacity, View } from 'react-native';

import AccessibleBottomSheet from '../../src/components/common/AccessibleBottomSheet';

describe('AccessibleBottomSheet', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('excludes the backdrop from focus and keeps the content in an accessibility modal', () => {
    const ref = createRef<AccessibleBottomSheet>();
    const view = render(
      <AccessibleBottomSheet ref={ref}>
        <TouchableOpacity accessibilityLabel="Station">
          <View />
        </TouchableOpacity>
      </AccessibleBottomSheet>
    );
    act(() => {
      ref.current?.open();
      jest.runAllTimers();
    });

    const [backdrop, station] = view.UNSAFE_getAllByType(TouchableOpacity);
    expect(backdrop.props).toMatchObject({
      accessible: false,
      focusable: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(station.props.accessibilityLabel).toBe('Station');
    expect(
      view
        .UNSAFE_getAllByType(View)
        .some(
          (node) =>
            node.props.accessibilityViewIsModal === true &&
            node.props.accessible === false
        )
    ).toBe(true);
    expect(view.UNSAFE_getByType(Modal).props.visible).toBe(true);

    act(() => {
      ref.current?.close();
      jest.runAllTimers();
    });
    expect(view.queryByA11yLabel('Station')).toBeNull();
  });

  it('still closes when the backdrop is tapped', () => {
    const ref = createRef<AccessibleBottomSheet>();
    const onClose = jest.fn();
    const view = render(
      <AccessibleBottomSheet ref={ref} onClose={onClose}>
        <View />
      </AccessibleBottomSheet>
    );
    act(() => {
      ref.current?.open();
      jest.runAllTimers();
    });
    fireEvent.press(view.UNSAFE_getByType(TouchableOpacity));
    act(() => jest.runAllTimers());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

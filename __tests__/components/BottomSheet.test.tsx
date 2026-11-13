import React from 'react';
import { View, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ModalBottomSheet } from '@swmansion/react-native-bottom-sheet';
import BottomSheet, {
  type BottomSheetRef,
} from '../../src/components/common/BottomSheet';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

describe('BottomSheet', () => {
  const setup = () => {
    const ref = React.createRef<BottomSheetRef>();
    const result = render(
      <BottomSheet ref={ref} height={600}>
        <Text>Sheet content</Text>
      </BottomSheet>
    );
    return {
      ref,
      ...result,
      getSheet: () => result.UNSAFE_getByType(ModalBottomSheet),
    };
  };

  it('hides closed content and opens in a native modal overlay', () => {
    const { ref, queryByText, getSheet } = setup();
    expect(queryByText('Sheet content')).toBeNull();

    act(() => ref.current?.open());

    expect(queryByText('Sheet content')).toBeTruthy();
    expect(getSheet().props.nativeOverlay).toBe(true);
    expect(getSheet().props.detents).toEqual([0, 600]);
    expect(getSheet().props.index).toBe(1);
  });

  it.each(['ref', 'back', 'escape', 'drag or scrim'])(
    'keeps content mounted until the closing animation settles (%s)',
    (trigger) => {
      const { ref, getSheet, queryByText } = setup();
      act(() => ref.current?.open());

      act(() => {
        if (trigger === 'ref') ref.current?.close();
        if (trigger === 'back') fireEvent(getSheet(), 'closeRequest');
        if (trigger === 'escape') {
          const content = getSheet()
            .findAllByType(View)
            .find((view) => view.props.accessibilityViewIsModal);
          fireEvent(content!, 'accessibilityEscape');
        }
        if (trigger === 'drag or scrim')
          fireEvent(getSheet(), 'indexChange', 0);
      });

      expect(getSheet().props.index).toBe(0);
      expect(queryByText('Sheet content')).toBeTruthy();
      fireEvent(getSheet(), 'settle', 0);
      expect(queryByText('Sheet content')).toBeNull();

      act(() => ref.current?.open());
      expect(queryByText('Sheet content')).toBeTruthy();
    }
  );

  it('keeps an opening sheet mounted when an older close animation settles', () => {
    const { ref, getSheet, queryByText } = setup();
    act(() => ref.current?.open());
    act(() => ref.current?.close());
    act(() => ref.current?.open());
    fireEvent(getSheet(), 'settle', 0);
    expect(queryByText('Sheet content')).toBeTruthy();
    expect(getSheet().props.index).toBe(1);
  });

  it('cancels an open followed immediately by close before mounting', () => {
    const { ref, queryByText } = setup();
    act(() => {
      ref.current?.open();
      ref.current?.close();
    });
    expect(queryByText('Sheet content')).toBeNull();
  });

  it('excludes decorative elements from keyboard and accessibility focus', () => {
    const { ref, getByTestId, getSheet } = setup();
    act(() => ref.current?.open());
    const handle = getByTestId('bottom_sheet_handle');
    const surface = getSheet().props.surface;
    for (const element of [handle, surface]) {
      expect(element.props.accessible).toBe(false);
      expect(element.props.focusable).toBe(false);
      expect(element.props.accessibilityElementsHidden).toBe(true);
      expect(element.props.importantForAccessibility).toBe(
        'no-hide-descendants'
      );
    }
  });
});

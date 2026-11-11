import React from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import FavoriteList from '@components/search/FavoriteList';
import type { Location } from '@store/location/types';

const mockIcon = (props: any) => <Text {...props}>icon</Text>;
const mockConfigGet = jest.fn();

jest.mock('@config', () => ({
  Config: { get: (...args: any[]) => mockConfigGet(...args) },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#111', border: '#ddd' },
  }),
}));
jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, options?: { location: string }) =>
      options ? `${key}: ${options.location}` : key,
  }),
}));

const elements: Location[] = ['Helsinki', 'Oulu', 'Turku'].map(
  (name, index) => ({
    name,
    area: '',
    id: index + 1,
    lat: 60,
    lon: 25,
    country: 'FI',
    timezone: 'Europe/Helsinki',
  })
);

const mockDropAnimation = (deferred = false) => {
  let complete = () => {};
  const stop = jest.fn();
  const timing = jest
    .spyOn(Animated, 'timing')
    .mockImplementation((value, config) => ({
      start: (callback) => {
        complete = () => {
          (value as Animated.Value).setValue(config.toValue as number);
          callback?.({ finished: true });
        };
        if (!deferred) complete();
      },
      stop,
      reset: jest.fn(),
    }));
  return { complete: () => act(() => complete()), stop, timing };
};

const mountList = (locations = elements) => {
  const props = {
    elements: locations,
    title: 'Favorites',
    onSelect: jest.fn(),
    onIconPress: jest.fn(),
    onReorder: jest.fn(),
    onDragStateChange: jest.fn(),
  };
  const view = render(<FavoriteList {...props} />);
  locations.forEach(({ id }, index) => {
    fireEvent(view.getByTestId(`favorite-row-${id}`), 'layout', {
      nativeEvent: { layout: { y: index * 45, height: 45, width: 320, x: 0 } },
    });
  });
  const drag = (id: number, distance: number, finish = 'responderRelease') => {
    const handle = view.getByTestId(`favorite-drag-handle-${id}`);
    fireEvent(handle, 'responderGrant', { nativeEvent: { pageY: 100 } });
    fireEvent(handle, 'responderMove', {
      nativeEvent: { pageY: 100 + distance },
    });
    fireEvent(handle, finish);
  };
  return { ...view, props, drag };
};

describe('FavoriteList', () => {
  beforeEach(() => {
    mockConfigGet.mockReturnValue({});
    mockDropAnimation();
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([0, 1, 2, 3])(
    'shows handles only with multiple favorites (%s)',
    (count) => {
      const view = mountList(elements.slice(0, count));
      expect(view.queryAllByTestId(/favorite-drag-handle-/)).toHaveLength(
        count > 1 ? count : 0
      );
    }
  );

  it.each([true, false, undefined])(
    'allows reordering unless favoritesPanelEnabled is false (%s)',
    (favoritesPanelEnabled) => {
      mockConfigGet.mockReturnValue({ favoritesPanelEnabled });
      const view = mountList();
      expect(view.queryAllByTestId(/favorite-drag-handle-/)).toHaveLength(
        favoritesPanelEnabled === false ? 0 : elements.length
      );
      fireEvent.press(view.getAllByA11yHint('choose')[1]);
      fireEvent.press(view.getByA11yLabel('removeFromFavorites: Oulu'));
      expect(view.props.onSelect).toHaveBeenCalledWith(elements[1]);
      expect(view.props.onIconPress).toHaveBeenCalledWith(elements[1]);
      expect(view.props.onReorder).not.toHaveBeenCalled();
      expect(view.props.onDragStateChange).not.toHaveBeenCalled();
    }
  );

  it.each(['drag', 'drop'])(
    'cancels a pending %s when favoritesPanelEnabled becomes false',
    (phase) => {
      const animation = mockDropAnimation(true);
      const view = mountList();
      const handle = view.getByTestId('favorite-drag-handle-1');
      fireEvent(handle, 'responderGrant', { nativeEvent: { pageY: 100 } });
      fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 170 } });
      if (phase === 'drop') fireEvent(handle, 'responderRelease');
      mockConfigGet.mockReturnValue({ favoritesPanelEnabled: false });
      view.update(<FavoriteList {...view.props} />);
      expect(view.queryAllByTestId(/favorite-drag-handle-/)).toHaveLength(0);
      animation.complete();
      expect(view.props.onReorder).not.toHaveBeenCalled();
      expect(view.props.onDragStateChange).toHaveBeenLastCalledWith(false);
    }
  );

  it('preserves location selection, removal and the clear action', () => {
    const view = mountList();
    fireEvent.press(view.getAllByA11yHint('choose')[1]);
    fireEvent.press(view.getByA11yLabel('removeFromFavorites: Oulu'));
    expect(view.props.onSelect).toHaveBeenCalledWith(elements[1]);
    expect(view.props.onIconPress).toHaveBeenCalledWith(elements[1]);
    const onClear = jest.fn();
    view.update(
      <FavoriteList
        {...view.props}
        clearTitle="Clear favorites"
        onClear={onClear}
      />
    );
    fireEvent.press(view.getByText('Clear favorites'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it.each([
    [1, 110, 0, 2],
    [3, -110, 2, 0],
    [1, 60, 0, 1],
  ])('moves favorite %s to its dropped position', (id, distance, from, to) => {
    const view = mountList();
    view.drag(id, distance);
    expect(view.props.onReorder).toHaveBeenCalledTimes(1);
    expect(view.props.onReorder).toHaveBeenCalledWith(from, to);
    expect(view.props.onSelect).not.toHaveBeenCalled();
    expect(view.props.onDragStateChange.mock.calls).toEqual([[true], [false]]);
  });

  it('previews the new position and waits until release before saving', () => {
    const view = mountList();
    const handle = view.getByTestId('favorite-drag-handle-1');
    fireEvent(handle, 'responderGrant', { nativeEvent: { pageY: 100 } });
    fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 170 } });
    expect(
      StyleSheet.flatten(view.getByTestId('favorite-row-2').props.style)
        .transform
    ).toEqual([{ translateY: -45 }]);
    expect(view.props.onReorder).not.toHaveBeenCalled();
    fireEvent(handle, 'responderRelease');
    expect(view.props.onReorder).toHaveBeenCalledWith(0, 1);
  });

  it('settles into the drop position without resetting the native transform before the new order arrives', () => {
    const animation = mockDropAnimation(true);
    const view = mountList();
    const handle = view.getByTestId('favorite-drag-handle-1');
    fireEvent(handle, 'responderGrant', { nativeEvent: { pageY: 100 } });
    fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 170 } });
    fireEvent(handle, 'responderRelease');
    const value = animation.timing.mock.calls[0][0] as Animated.Value;
    const setValue = jest.spyOn(value, 'setValue');
    expect(
      StyleSheet.flatten(view.getByTestId('favorite-row-1').props.style)
        .transform
    ).toEqual([{ translateY: 70 }]);
    expect(view.props.onReorder).not.toHaveBeenCalled();
    expect(view.props.onDragStateChange).toHaveBeenLastCalledWith(true);
    // A late move/release must not interrupt or restart the drop animation.
    fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 200 } });
    fireEvent(handle, 'responderRelease');
    expect(setValue).not.toHaveBeenCalled();
    expect(animation.timing).toHaveBeenCalledTimes(1);
    animation.complete();
    expect(setValue.mock.calls).toEqual([[45]]);
    expect(view.props.onReorder).toHaveBeenCalledWith(0, 1);
    view.update(
      <FavoriteList
        {...view.props}
        elements={[elements[1], elements[0], elements[2]]}
      />
    );
    expect(
      view
        .getAllByTestId('search_result_text')
        .map((node) => node.props.children)
    ).toEqual(['Oulu', 'Helsinki', 'Turku']);
    expect(
      StyleSheet.flatten(view.getByTestId('favorite-row-1').props.style)
        .transform
    ).toEqual([{ translateY: 0 }]);
    // Reset only when beginning another drag, after the previous transform is detached.
    fireEvent(view.getByTestId('favorite-drag-handle-2'), 'responderGrant', {
      nativeEvent: { pageY: 100 },
    });
    expect(setValue).toHaveBeenLastCalledWith(0);
  });

  it.each(['update', 'unmount'])(
    'cancels a pending drop on %s without saving a stale order',
    (operation) => {
      const animation = mockDropAnimation(true);
      const view = mountList();
      view.drag(1, 70);
      if (operation === 'unmount') view.unmount();
      else
        view.update(
          <FavoriteList {...view.props} elements={elements.slice(1)} />
        );
      expect(animation.stop).toHaveBeenCalled();
      animation.complete();
      expect(view.props.onReorder).not.toHaveBeenCalled();
      expect(view.props.onDragStateChange).toHaveBeenLastCalledWith(false);
    }
  );

  it('skips the settling animation when reduced motion is enabled', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    const animation = mockDropAnimation();
    const view = mountList();
    await act(async () => {});
    view.drag(1, 70);
    expect(animation.timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 0 })
    );
    expect(view.props.onReorder).toHaveBeenCalledWith(0, 1);
  });

  it.each([0, 10, -100])(
    'does not save a drop in the original position (%s)',
    (distance) => {
      const view = mountList();
      view.drag(1, distance);
      expect(view.props.onReorder).not.toHaveBeenCalled();
    }
  );

  it('does not save after dragging away and returning to the original position', () => {
    const view = mountList();
    const handle = view.getByTestId('favorite-drag-handle-1');
    fireEvent(handle, 'responderGrant', { nativeEvent: { pageY: 100 } });
    fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 200 } });
    fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 100 } });
    fireEvent(handle, 'responderRelease');
    expect(view.props.onReorder).not.toHaveBeenCalled();
  });

  it('cancels an interrupted drag and restores scrolling', () => {
    const view = mountList();
    view.drag(1, 100, 'responderTerminate');
    expect(view.props.onReorder).not.toHaveBeenCalled();
    expect(view.props.onDragStateChange).toHaveBeenLastCalledWith(false);
  });

  it.each(['update', 'unmount'])(
    'cancels an active drag on %s',
    (operation) => {
      const view = mountList();
      const handle = view.getByTestId('favorite-drag-handle-3');
      fireEvent(handle, 'responderGrant', { nativeEvent: { pageY: 100 } });
      fireEvent(handle, 'responderMove', { nativeEvent: { pageY: 0 } });
      if (operation === 'unmount') view.unmount();
      else
        view.update(
          <FavoriteList {...view.props} elements={elements.slice(0, 2)} />
        );
      expect(view.props.onReorder).not.toHaveBeenCalled();
      expect(view.props.onDragStateChange).toHaveBeenLastCalledWith(false);
    }
  );

  it('offers accessible moves within the list bounds', () => {
    const view = mountList();
    const first = view.getByA11yLabel('reorderFavorite: Helsinki');
    expect(first.props.accessibilityRole).toBe('adjustable');
    expect(first.props.accessibilityValue).toEqual({ min: 1, max: 3, now: 1 });
    expect(first.props.accessibilityActions).toEqual([
      { name: 'increment', label: 'moveFavoriteDown' },
    ]);
    fireEvent(first, 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });
    expect(view.props.onReorder).not.toHaveBeenCalled();
    fireEvent(first, 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });
    expect(view.props.onReorder).toHaveBeenLastCalledWith(0, 1);
    const last = view.getByA11yLabel('reorderFavorite: Turku');
    expect(last.props.accessibilityActions).toEqual([
      { name: 'decrement', label: 'moveFavoriteUp' },
    ]);
    fireEvent(last, 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });
    expect(view.props.onReorder).toHaveBeenLastCalledWith(2, 1);
    expect(view.props.onDragStateChange).not.toHaveBeenCalled();
  });
});

import './screenTestMocks';

import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import SearchScreen from '../../src/screens/SearchScreen';
import FavoriteList from '@components/search/FavoriteList';
import { mockGetGeolocation, mockLocationStore, mockTrackMatomoEvent, resetScreenMocks } from './screenTestMocks';

jest.unmock('@components/common/AccessibleTouchableOpacity');

describe('SearchScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('searches after debounce and clears input', async () => {
    const props = createProps();
    const { getByTestId, queryByTestId } = render(<SearchScreen {...props as any} />);

    fireEvent.changeText(getByTestId('search_input'), 'hel');
    expect(props.setLoading).toHaveBeenCalledWith(true);

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    expect(props.searchLocation).toHaveBeenCalledWith('hel');
    expect(getByTestId('search_clear_button')).toBeTruthy();

    fireEvent.press(getByTestId('search_clear_button'));
    expect(queryByTestId('search_clear_button')).toBeNull();
  });

  it('selects search result and updates current location', () => {
    const helsinki = { area: 'Uusimaa', id: 1, name: 'Helsinki' };
    const props = createProps({ search: [helsinki] });
    const { getByTestId } = render(<SearchScreen {...props as any} />);

    fireEvent.press(getByTestId('select-1'));

    expect(props.updateRecentSearches).toHaveBeenCalledWith(helsinki);
    expect(props.setAnimateToArea).toHaveBeenCalledWith(true);
    expect(props.setCurrentLocation).toHaveBeenCalledWith(helsinki);
    expect(props.navigation.goBack).toHaveBeenCalled();
  });

  it('toggles favorites', () => {
    const helsinki = { area: 'Uusimaa', id: 1, name: 'Helsinki' };
    const oulu = { area: 'Oulu', id: 2, name: 'Oulu' };
    const props = createProps({
      favorites: [oulu],
      search: [helsinki],
    });
    const { getByTestId } = render(<SearchScreen {...props as any} />);

    fireEvent.press(getByTestId('icon-1'));
    expect(props.addFavorite).toHaveBeenCalledWith(helsinki);

    fireEvent.press(getByTestId('icon-2'));
    expect(props.deleteFavorite).toHaveBeenCalledWith(2);
  });

  it('saves and tracks a favorite reorder and disables scrolling during dragging', () => {
    const props = createProps({ favorites: [{ id: 1, name: 'Helsinki' }, { id: 2, name: 'Oulu' }] });
    const view = render(<SearchScreen {...props as any} />);
    const list = view.UNSAFE_getByType(FavoriteList);
    fireEvent.scroll(view.UNSAFE_getByType(ScrollView), { nativeEvent: { contentOffset: { y: 120 } } });
    expect(list.props.autoScroll.getOffset()).toBe(120);
    act(() => list.props.onReorder(1, 0));
    expect(props.reorderFavorites).toHaveBeenCalledWith(1, 0);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Reorder favourites');
    act(() => list.props.onDragStateChange(true));
    expect(view.UNSAFE_getByType(ScrollView).props.scrollEnabled).toBe(false);
    act(() => list.props.onDragStateChange(false));
    expect(view.UNSAFE_getByType(ScrollView).props.scrollEnabled).toBe(true);
  });

  it.each(['press', 'click'] as const)('locates once from the labeled row via %s', (interaction) => {
    const props = createProps();
    const { getByLabelText } = render(<SearchScreen {...props as any} />);
    const button = getByLabelText('locate');

    expect(button.props.accessibilityRole).toBe('button');
    if (interaction === 'press') {
      fireEvent.press(button);
    } else {
      fireEvent(button, 'click', { nativeEvent: {}, currentTarget: 1, target: 1 });
    }

    expect(mockGetGeolocation).toHaveBeenCalledTimes(1);
    expect(mockGetGeolocation).toHaveBeenCalledWith(
      props.setCurrentLocation,
      expect.any(Function),
      undefined,
      expect.any(Function)
    );
    const current = { id: 3, name: 'Current location' };
    mockLocationStore.getState.mockReturnValue({ location: { current } });
    expect(mockGetGeolocation.mock.calls[0][3]()).toBe(current);
    expect(props.navigation.goBack).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Geolocation - button');
  });
});

const createProps = (overrides: Record<string, any> = {}) => ({
  addFavorite: jest.fn(),
  reorderFavorites: jest.fn(),
  deleteAllFavorites: jest.fn(),
  deleteAllRecentSearches: jest.fn(),
  deleteFavorite: jest.fn(),
  favorites: [],
  loading: false,
  navigation: { goBack: jest.fn() },
  recent: [],
  resetSearch: jest.fn(),
  search: [],
  searchLocation: jest.fn(),
  setAnimateToArea: jest.fn(),
  setCurrentLocation: jest.fn(),
  setLoading: jest.fn(),
  updateRecentSearches: jest.fn(),
  ...overrides,
});

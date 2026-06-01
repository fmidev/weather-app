import './screenTestMocks';

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import SearchScreen from '../../src/screens/SearchScreen';
import { mockGetGeolocation, resetScreenMocks } from './screenTestMocks';

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

  it('toggles favorites and uses geolocation action', () => {
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

    fireEvent.press(getByTestId('icon-button-locate'));
    expect(mockGetGeolocation).toHaveBeenCalledWith(
      props.setCurrentLocation,
      expect.any(Function)
    );
  });
});

const createProps = (overrides: Record<string, any> = {}) => ({
  addFavorite: jest.fn(),
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

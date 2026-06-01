import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import AreaList from '../../src/components/search/AreaList';

const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#d9d9d9',
      text: '#111111',
      hourListText: '#666666',
      primary: '#0062cc',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'remember') return 'Remember';
      if (key === 'choose') return 'Choose location';
      if (key === 'addToFavorites') return `Add ${options.location} to favorites`;
      if (key === 'removeFromFavorites') return `Remove ${options.location} from favorites`;
      return key;
    },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('AreaList', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders header and locations, including geolocation marker, and selects location', () => {
    const onSelect = jest.fn();
    const onIconPress = jest.fn();

    const elements = [
      {
        id: '1',
        name: 'Helsinki',
        area: 'Uusimaa',
        isGeolocation: true,
      },
      {
        id: '2',
        name: 'Oulu',
        area: 'Oulu',
      },
    ] as any;

    const { getByText, getAllByTestId, getAllByA11yHint, getByA11yLabel } = render(
      <AreaList
        testID="area-list"
        elements={elements}
        title="Recent searches"
        onSelect={onSelect}
        onIconPress={onIconPress}
      />
    );

    expect(getByText('Recent searches')).toBeTruthy();
    expect(getByText('Remember')).toBeTruthy();
    expect(getByText('Helsinki, Uusimaa')).toBeTruthy();
    expect(getByText('Oulu')).toBeTruthy();
    expect(getAllByTestId('search_result_text')).toHaveLength(2);
    expect(getByA11yLabel('Add Helsinki, Uusimaa to favorites')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'map-marker',
      })
    );

    fireEvent.press(getAllByA11yHint('Choose location')[0]);

    expect(onSelect).toHaveBeenCalledWith(elements[0]);
  });

  it('uses iconNameGetter result and triggers icon action with remove-from-favorites label', () => {
    const onSelect = jest.fn();
    const onIconPress = jest.fn();

    const elements = [
      {
        id: '1',
        name: 'Tampere',
        area: 'Pirkanmaa',
      },
    ] as any;

    const { getByA11yLabel } = render(
      <AreaList
        elements={elements}
        title="Favorites"
        onSelect={onSelect}
        onIconPress={onIconPress}
        iconNameGetter={() => 'star-selected'}
      />
    );

    fireEvent.press(getByA11yLabel('Remove Tampere, Pirkanmaa from favorites'));

    expect(onIconPress).toHaveBeenCalledWith(elements[0]);
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'star-selected',
        style: expect.arrayContaining([
          expect.objectContaining({
            color: '#0062cc',
          }),
        ]),
      })
    );
  });

  it('renders clear action row and calls onClear', () => {
    const onClear = jest.fn();

    const { getByText } = render(
      <AreaList
        elements={[]}
        title="Recent"
        clearTitle="Clear all"
        onClear={onClear}
        onSelect={() => {}}
        onIconPress={() => {}}
      />
    );

    fireEvent.press(getByText('Clear all'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

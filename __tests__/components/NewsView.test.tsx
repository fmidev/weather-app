import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import NewsView from '../../src/components/news/NewsView';

const mockTrackMatomoEvent = jest.fn();
const mockFormatAccessibleDate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#1a1a1a',
      inputButtonBackground: '#f2f2f2',
      text: '#222222',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'fi' },
    t: (key: string) => {
      if (key === 'readMore') return 'Read more';
      if (key === 'updated') return 'Updated';
      if (key === 'news') return 'News';
      return key;
    },
  }),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleDate: (...args: any[]) => mockFormatAccessibleDate(...args),
}));

jest.mock('@d11/react-native-fast-image', () => {
  const { View } = require('react-native');
  const FastImage = (props: any) => <View testID="news-image" {...props} />;
  FastImage.cacheControl = { immutable: 'immutable' };
  return {
    __esModule: true,
    default: FastImage,
  };
});

describe('NewsView', () => {
  let canOpenURLSpy: jest.SpyInstance;
  let openURLSpy: jest.SpyInstance;

  beforeAll(() => {
    canOpenURLSpy = jest
      .spyOn(ReactNative.Linking, 'canOpenURL')
      .mockResolvedValue(true as never);
    openURLSpy = jest
      .spyOn(ReactNative.Linking, 'openURL')
      .mockResolvedValue(undefined as never);
  });

  afterAll(() => {
    canOpenURLSpy.mockRestore();
    openURLSpy.mockRestore();
  });

  beforeEach(() => {
    mockTrackMatomoEvent.mockClear();
    mockFormatAccessibleDate.mockClear();
    canOpenURLSpy.mockClear();
    openURLSpy.mockClear();
  });

  it('renders news metadata, builds image url by viewport width and opens article link from button', async () => {
    mockFormatAccessibleDate
      .mockReturnValueOnce('Saturday, 3 March 2035')
      .mockReturnValueOnce('Sunday, 4 March 2035');

    const item = {
      id: '12345',
      type: 'news',
      title: 'Spring weather outlook',
      imageUrl: 'https://cdn.example.com/news-image.webp',
      imageAlt: 'Clouds over Helsinki',
      createdAt: '2035-03-03T10:15:00+02:00',
      updatedAt: '2035-03-04T11:30:00+02:00',
      language: 'fi',
      showEditedDateTime: true,
    };

    const { getByText, getByTestId } = render(<NewsView item={item} titleNumberOfLines={2} />);

    expect(getByText('Spring weather outlook')).toBeTruthy();
    expect(
      getByText('News 3.3.2035 (Updated 4.3.2035 11:30)').props.accessibilityLabel
    ).toBe('News Saturday, 3 March 2035 (Updated Sunday, 4 March 2035)');

    const image = getByTestId('news-image');
    expect(image.props.source).toEqual({
      uri: 'https://cdn.example.com/news-image.webp?w=512',
      cache: 'immutable',
    });

    fireEvent.press(getByText('Read more'));

    await waitFor(() => {
      expect(canOpenURLSpy).toHaveBeenCalledWith(
        'https://www.ilmatieteenlaitos.fi/news/12345?referrer=fmi-mobile-app'
      );
      expect(openURLSpy).toHaveBeenCalledWith(
        'https://www.ilmatieteenlaitos.fi/news/12345?referrer=fmi-mobile-app'
      );
    });
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });
});

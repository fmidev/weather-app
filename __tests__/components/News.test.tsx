import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import News from '../../src/components/news/News';

const mockSelectLoading = jest.fn((state: any) => state.mock.loading);
const mockSelectError = jest.fn((state: any) => state.mock.error);
const mockSelectNews = jest.fn((state: any) => state.mock.news);
const mockConfigGet = jest.fn();
const mockWindowDimensions = jest.fn();
const mockPanelHeader = jest.fn((props) => (
  <Text testID="news-panel-header">{props.title}</Text>
));
const mockNewsView = jest.fn((props) => (
  <Text testID={`news-view-${props.item.id}`}>{props.item.title}</Text>
));

jest.mock('@store/news/selector', () => ({
  selectLoading: (state: any) => mockSelectLoading(state),
  selectError: (state: any) => mockSelectError(state),
  selectNews: (state: any) => mockSelectNews(state),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 4,
    right: 6,
    top: 0,
    bottom: 0,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'title') return 'News';
      if (key === 'error') return 'News loading failed';
      return key;
    },
    i18n: {
      language: 'fi',
    },
  }),
}));

jest.mock('moti', () => ({
  MotiView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="moti-view">{children}</View>;
  },
}));

jest.mock('moti/skeleton', () => ({
  Skeleton: () => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="news-skeleton">loading</MockText>;
  },
}), { virtual: true });

jest.mock('@components/common/PanelHeader', () => ({
  __esModule: true,
  default: (props: any) => mockPanelHeader(props),
}));

jest.mock('../../src/components/news/NewsView', () => ({
  __esModule: true,
  default: (props: any) => mockNewsView(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const newsItems = [
  { id: '1', title: 'First item' },
  { id: '2', title: 'Second item' },
];

describe('News', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowDimensions.mockReturnValue({ width: 390, height: 844 });
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockImplementation(
      () => mockWindowDimensions()
    );

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'news') {
        return {
          enabled: true,
          numberOfNews: 3,
          apiUrl: {
            fi: 'https://example.test/news',
          },
        };
      }
      return {};
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when news feature is disabled', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'news') {
        return {
          enabled: false,
          numberOfNews: 3,
          apiUrl: { fi: 'https://example.test/news' },
        };
      }
      return {};
    });

    const store = createStore({
      mock: {
        loading: false,
        error: undefined,
        news: newsItems,
      },
    });

    const { toJSON } = render(
      <Provider store={store as any}>
        <News />
      </Provider>
    );

    expect(toJSON()).toBeNull();
  });

  it('renders loading skeletons when loading and news list is empty', () => {
    const store = createStore({
      mock: {
        loading: true,
        error: undefined,
        news: [],
      },
    });

    const { getByTestId, getAllByTestId } = render(
      <Provider store={store as any}>
        <News />
      </Provider>
    );

    expect(getByTestId('moti-view')).toBeTruthy();
    expect(getByTestId('news-panel-header')).toBeTruthy();
    expect(getAllByTestId('news-skeleton')).toHaveLength(3);
  });

  it('renders error state when loading failed', () => {
    const store = createStore({
      mock: {
        loading: false,
        error: 'boom',
        news: undefined,
      },
    });

    const { getByText, getByTestId } = render(
      <Provider store={store as any}>
        <News />
      </Provider>
    );

    expect(getByTestId('news-panel-header')).toBeTruthy();
    expect(getByText('News loading failed')).toBeTruthy();
  });

  it('renders news list in single-column layout on narrow screens', () => {
    const store = createStore({
      mock: {
        loading: false,
        error: undefined,
        news: newsItems,
      },
    });

    const { getByTestId } = render(
      <Provider store={store as any}>
        <News />
      </Provider>
    );

    expect(getByTestId('news-view-1')).toBeTruthy();
    expect(getByTestId('news-view-2')).toBeTruthy();
    expect(mockNewsView).toHaveBeenCalledWith(
      expect.objectContaining({
        item: newsItems[0],
      })
    );
    expect(mockNewsView).not.toHaveBeenCalledWith(
      expect.objectContaining({
        gridLayout: true,
      })
    );
  });

  it('renders news grid layout on wide screens', () => {
    mockWindowDimensions.mockReturnValue({ width: 900, height: 900 });

    const store = createStore({
      mock: {
        loading: false,
        error: undefined,
        news: newsItems,
      },
    });

    render(
      <Provider store={store as any}>
        <News />
      </Provider>
    );

    expect(mockNewsView).toHaveBeenCalledWith(
      expect.objectContaining({
        item: newsItems[0],
        titleNumberOfLines: 2,
        gridLayout: true,
      })
    );
    expect(mockNewsView).toHaveBeenCalledWith(
      expect.objectContaining({
        item: newsItems[1],
        titleNumberOfLines: 2,
        gridLayout: true,
      })
    );
  });
});

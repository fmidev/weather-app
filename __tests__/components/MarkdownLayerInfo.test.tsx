import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import MarkdownLayerInfo from '../../src/components/map/ui/MarkdownLayerInfo';

const mockSelectActiveOverlay = jest.fn();
const mockGetLayerDocumentation = jest.fn();
const mockConfigGet = jest.fn();
const mockRendererSetHeadingColor = jest.fn();
const mockRendererSetTextColor = jest.fn();
const mockRendererSetTranslationFunction = jest.fn();

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: () => mockSelectActiveOverlay(),
}));

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => (props: any) => (
    <Component {...props} activeOverlay={mockSelectActiveOverlay()} />
  ),
}));

jest.mock('@network/MarkdownApi', () => ({
  getLayerDocumentation: (...args: any[]) => mockGetLayerDocumentation(...args),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      text: '#111111',
      primaryText: '#222222',
      background: '#ffffff',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'infoBottomSheet.markdownLoadingFailed') return 'Loading failed';
      return key;
    },
    i18n: {
      language: 'en',
    },
  }),
}));

jest.mock('@components/markdown/MarkdownRenderer', () => ({
  MarkdownRenderer: jest.fn().mockImplementation(() => ({
    setHeadingColor: (...args: any[]) => mockRendererSetHeadingColor(...args),
    setTextColor: (...args: any[]) => mockRendererSetTextColor(...args),
    setTranslationFunction: (...args: any[]) => mockRendererSetTranslationFunction(...args),
  })),
}));

jest.mock('react-native-marked', () => ({
  __esModule: true,
  default: ({ value }: any) => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="markdown-content">{value}</MockText>;
  },
}));

jest.mock('moti', () => ({
  MotiView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="moti-view">{children}</View>;
  },
  View: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('moti/skeleton', () => ({
  Skeleton: () => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="skeleton">loading</MockText>;
  },
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="safe-area">{children}</View>;
  },
}));

describe('MarkdownLayerInfo', () => {
  const mapConfig = {
    layers: [
      {
        id: 1,
        type: 'WMS',
        sources: [{ layer: 'weather:radar' }],
      },
      {
        id: 2,
        type: 'Timeseries',
        sources: [{ layer: 'ignored' }],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return mapConfig;
      }
      return {};
    });
    mockSelectActiveOverlay.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading skeleton and fetches markdown for active WMS layer', async () => {
    mockGetLayerDocumentation.mockResolvedValue('# Layer docs');
    mockSelectActiveOverlay.mockReturnValue(1);

    const { getAllByTestId, getByTestId } = render(
      <MarkdownLayerInfo />
    );

    expect(getByTestId('moti-view')).toBeTruthy();
    expect(getAllByTestId('skeleton').length).toBeGreaterThan(1);

    await waitFor(() => {
      expect(mockGetLayerDocumentation).toHaveBeenCalledWith('weather:radar', 'en');
    });

    expect(mockRendererSetHeadingColor).toHaveBeenCalledWith('#111111');
  });

  it('shows loading skeleton while markdown is loading', () => {
    mockSelectActiveOverlay.mockReturnValue(2);

    const { getAllByTestId, getByTestId } = render(
      <MarkdownLayerInfo />
    );

    expect(getByTestId('moti-view')).toBeTruthy();
    expect(getAllByTestId('skeleton').length).toBeGreaterThan(1);
  });

  it('fetches timeseries markdown for active timeseries layer', async () => {
    mockGetLayerDocumentation.mockResolvedValue('# Timeseries docs');
    mockSelectActiveOverlay.mockReturnValue(2);

    render(
      <MarkdownLayerInfo />
    );

    await waitFor(() => {
      expect(mockGetLayerDocumentation).toHaveBeenCalledWith('timeseries', 'en');
    });
  });
});

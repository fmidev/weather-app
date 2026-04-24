import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import WarningsWebViewPanel from '../../src/components/warnings/WarningsWebViewPanel';

const mockGetConfig = jest.fn();
const mockTheme = jest.fn();
const mockTranslation = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockGetConfig(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => mockTheme(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => mockTranslation(),
}));

jest.mock('@components/weather/common/PanelHeader', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'warnings-webview-title' }, title);
  },
}));

jest.mock('react-native-webview', () => ({
  WebView: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props);
  },
}));

describe('WarningsWebViewPanel', () => {
  beforeEach(() => {
    mockGetConfig.mockReset();
    mockTheme.mockReset();
    mockTranslation.mockReset();

    mockTheme.mockReturnValue({
      dark: false,
      colors: {},
    });
    mockTranslation.mockReturnValue({
      i18n: { language: 'fi' },
      t: (key: string) => (key === 'allWarnings' ? 'All warnings' : key),
    });
  });

  it('returns null when warnings.webViewUrl is not configured', () => {
    mockGetConfig.mockReturnValue({ webViewUrl: '' });

    const { toJSON } = render(<WarningsWebViewPanel updateInterval={60} />);
    expect(toJSON()).toBeNull();
  });

  it('renders fallback for invalid URL format', () => {
    mockGetConfig.mockReturnValue({ webViewUrl: 'not-a-valid-url' });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(<WarningsWebViewPanel updateInterval={60} />);
    expect(getByText('Invalid webview URL blocked')).toBeTruthy();

    errorSpy.mockRestore();
  });

  it('renders fallback when URL host is not allowed', () => {
    mockGetConfig.mockReturnValue({ webViewUrl: 'https://example.com/widget' });

    const { getByText } = render(<WarningsWebViewPanel updateInterval={60} />);
    expect(getByText('Invalid webview URL blocked')).toBeTruthy();
  });

  it('renders webview html for allowed host and updates webview height on message', () => {
    mockTheme.mockReturnValue({
      dark: true,
      colors: {},
    });
    mockTranslation.mockReturnValue({
      i18n: { language: 'sv' },
      t: (key: string) => (key === 'allWarnings' ? 'All warnings' : key),
    });
    mockGetConfig.mockReturnValue({ webViewUrl: 'https://cdn.fmi.fi/warnings/client' });

    const { getByTestId } = render(<WarningsWebViewPanel updateInterval={180} />);

    expect(getByTestId('warnings-webview-title')).toBeTruthy();

    const webview = getByTestId('warnings_webview');
    const html: string = webview.props.source.html;

    expect(html).toContain('<html lang="sv">');
    expect(html).toContain('language="sv"');
    expect(html).toContain('theme="dark"');
    expect(html).toContain('font-scale="2"');
    expect(html).toContain('src="https://cdn.fmi.fi/warnings/client/index.js" refresh-interval="180"');
    expect(webview.props.style.height).toBe(2000);

    fireEvent(webview, 'message', { nativeEvent: { data: '777' } });
    expect(getByTestId('warnings_webview').props.style.height).toBe(777);
  });
});

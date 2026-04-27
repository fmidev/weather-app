import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

const mockTrackMatomoEvent = jest.fn();
const mockIcon = jest.fn((props) => {
  const { Text: MockText } = require('react-native');
  return <MockText {...props} testID={`icon-${props.name}`}>{props.name}</MockText>;
});

jest.mock('react-native-marked', () => ({
  Renderer: class {},
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('../../src/components/markdown/TemperatureLegend', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="temperature-legend">legend</Text>;
  },
}));

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders plain text with configured text color', () => {
    const { MarkdownRenderer } = require('../../src/components/markdown/MarkdownRenderer');
    const renderer = new MarkdownRenderer();
    renderer.setTextColor('#112233');

    const { getByText } = render(renderer.text('Plain text'));
    const text = getByText('Plain text');
    const styleArray = Array.isArray(text.props.style)
      ? text.props.style
      : [text.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.color).toBe('#112233');
    expect(mergedStyle.fontFamily).toBe('Roboto-Regular');
  });

  it('renders inline icon and temperature legend tokens', () => {
    const { MarkdownRenderer } = require('../../src/components/markdown/MarkdownRenderer');
    const renderer = new MarkdownRenderer();

    const { getByText, getByTestId } = render(
      renderer.text('Before [icon:wind-dark|20|24] [temperature-legend] After')
    );

    expect(getByText('Before ')).toBeTruthy();
    expect(getByText(' After')).toBeTruthy();
    expect(getByTestId('icon-wind-dark')).toBeTruthy();
    expect(getByTestId('temperature-legend')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'wind-dark',
        width: 20,
        height: 24,
      })
    );
  });

  it('renders radar legend from markdown link syntax', () => {
    const { MarkdownRenderer } = require('../../src/components/markdown/MarkdownRenderer');
    const renderer = new MarkdownRenderer();
    renderer.setTranslationFunction((key: string) =>
      key === 'markdownRenderer.radarLegendDescription'
        ? 'Radar legend description'
        : key
    );

    const { getByText, getByA11yLabel } = render(
      renderer.link(
        'legend:#111111,#222222,#333333',
        '/Low|Medium|High'
      )
    );

    expect(getByText('Low')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
    expect(getByText('High')).toBeTruthy();
    expect(getByA11yLabel('Radar legend description')).toBeTruthy();
  });

  it('opens tracked external link and sends matomo event', async () => {
    const { MarkdownRenderer } = require('../../src/components/markdown/MarkdownRenderer');
    const renderer = new MarkdownRenderer();
    renderer.setTranslationFunction((key: string) =>
      key === 'markdonwRenderer.openInBrowser' ? 'Open in browser' : key
    );
    renderer.setTextColor('#445566');
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);

    const { getByA11yRole, getByTestId } = render(
      renderer.link('Documentation', 'https://example.test/docs|Map')
    );

    expect(getByTestId('icon-open-in-new')).toBeTruthy();
    expect(getByA11yRole('link').props.accessibilityHint).toBe('Open in browser');

    fireEvent.press(getByA11yRole('link'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Open URL - https://example.test/docs'
    );
    expect(openURLSpy).toHaveBeenCalledWith('https://example.test/docs');

    openURLSpy.mockRestore();
  });

  it('formats mailto links with app version and hides external-link icon', () => {
    const { MarkdownRenderer } = require('../../src/components/markdown/MarkdownRenderer');
    const renderer = new MarkdownRenderer();
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);

    const { getByA11yRole, queryByTestId } = render(
      renderer.link('Email support', 'mailto:test@example.com?body=v{version}|Other')
    );

    expect(queryByTestId('icon-open-in-new')).toBeNull();

    fireEvent.press(getByA11yRole('link'));

    expect(openURLSpy).toHaveBeenCalledWith(
      expect.stringContaining('v6.0.11')
    );

    openURLSpy.mockRestore();
  });
});

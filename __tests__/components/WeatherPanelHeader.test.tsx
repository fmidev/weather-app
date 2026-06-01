import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import PanelHeader from '../../src/components/weather/common/PanelHeader';
import { RED } from '../../src/assets/colors';

const mockCommonPanelHeader = jest.fn((props) => (
  <View testID="common-panel-header">{props.additionalContent}</View>
));

jest.mock('@components/common/PanelHeader', () => ({
  __esModule: true,
  default: (props: any) => mockCommonPanelHeader(props),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#101010',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'updated' ? 'Updated' : key),
  }),
}));

describe('weather/common/PanelHeader', () => {
  beforeEach(() => {
    mockCommonPanelHeader.mockClear();
  });

  it('passes title as accessibilityLabel when no lastUpdated is provided', () => {
    render(<PanelHeader title="Forecast" />);

    expect(mockCommonPanelHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Forecast',
        accessibilityLabel: 'Forecast',
        additionalContent: undefined,
      })
    );
  });

  it('builds accessibility label and styled additionalContent from lastUpdated', () => {
    render(
      <PanelHeader
        title="Observations"
        accessibleTitle="Observation panel"
        lastUpdated={{ time: '12:14', ageCheck: true }}
        justifyCenter
        thin
        background="#fafafa"
      />
    );

    expect(mockCommonPanelHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Observations',
        accessibilityLabel: 'Observation panel, Updated 12:14',
        justifyCenter: true,
        thin: true,
        background: '#fafafa',
      })
    );

    const props = mockCommonPanelHeader.mock.calls[0][0];
    const additionalContent = props.additionalContent;
    expect(additionalContent).toBeTruthy();
    expect(additionalContent.props.accessibilityLabel).toBe('Observation panel, Updated 12:14');
    expect(additionalContent.props.children[0]).toBe('Updated');

    const styleArray = Array.isArray(additionalContent.props.style)
      ? additionalContent.props.style
      : [additionalContent.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);
    expect(mergedStyle.color).toBe(RED);
    expect(mergedStyle.fontSize).toBe(14);
  });

  it('uses accessibleLastUpdated in accessibilityLabel when provided', () => {
    render(
      <PanelHeader
        title="Warnings"
        lastUpdated={{ time: '09:00', ageCheck: false }}
        accessibleLastUpdated="9 o clock"
      />
    );

    expect(mockCommonPanelHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        accessibilityLabel: 'Warnings, Updated 9 o clock',
      })
    );
  });
});

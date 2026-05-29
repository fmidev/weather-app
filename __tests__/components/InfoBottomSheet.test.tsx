import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import InfoBottomSheet from '../../src/components/map/sheets/InfoBottomSheet';

const mockConfigGet = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'infoBottomSheet.closeAccessibilityLabel') {
        return 'Close map info';
      }
      return key;
    },
  }),
}));

jest.mock('@components/common/CloseButton', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return ({ onPress, testID, accessibilityLabel }: any) => (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Text>Close</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../src/components/map/ui/LegacyLayerInfo', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="legacy-layer-info">legacy</Text>;
  },
}));

jest.mock('../../src/components/map/ui/MarkdownLayerInfo', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="markdown-layer-info">markdown</Text>;
  },
}));

describe('InfoBottomSheet', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
  });

  it('renders markdown info variant and closes from button', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          infoBottomSheet: {
            url: 'https://example.test/info.md',
          },
        };
      }
      return {};
    });

    const onClose = jest.fn();
    const { getByTestId, getByA11yLabel, queryByTestId } = render(
      <InfoBottomSheet onClose={onClose} />
    );

    expect(getByTestId('info_bottom_sheet')).toBeTruthy();
    expect(getByTestId('markdown-layer-info')).toBeTruthy();
    expect(queryByTestId('legacy-layer-info')).toBeNull();
    expect(getByA11yLabel('Close map info')).toBeTruthy();

    fireEvent.press(getByTestId('info_bottom_sheet_close_button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders legacy info variant when markdown url is missing', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          infoBottomSheet: {},
        };
      }
      return {};
    });

    const { getByTestId, queryByTestId } = render(
      <InfoBottomSheet onClose={() => {}} />
    );

    expect(getByTestId('legacy-layer-info')).toBeTruthy();
    expect(queryByTestId('markdown-layer-info')).toBeNull();
  });
});

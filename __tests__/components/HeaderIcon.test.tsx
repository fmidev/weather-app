import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import HeaderIcon from '../../src/components/common/HeaderIcon';

const mockUseTranslation = jest.fn();
const mockIcon = jest.fn((props) => <Text {...props} testID="header-icon">icon</Text>);

jest.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      text: '#0a0a0a',
    },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('HeaderIcon', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders provider logo for current language', () => {
    mockUseTranslation.mockReturnValue({
      i18n: { language: 'fi' },
    });

    const { getByTestId } = render(<HeaderIcon />);
    expect(getByTestId('header-icon')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'provider-logo-fi',
        style: { color: '#0a0a0a' },
        height: 30,
      })
    );
  });

  it('updates icon name when language changes', () => {
    mockUseTranslation.mockReturnValue({
      i18n: { language: 'en' },
    });

    render(<HeaderIcon />);
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'provider-logo-en',
      })
    );
  });
});

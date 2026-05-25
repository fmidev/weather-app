import './screenTestMocks';

import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import FeedbackScreen from '../../src/screens/FeedbackScreen';
import {
  mockConfigGet,
  mockTrackMatomoEvent,
  resetScreenMocks,
} from './screenTestMocks';

describe('FeedbackScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);
  });

  it('opens feedback mail link with configured localized subject', () => {
    const { getByTestId } = render(<FeedbackScreen />);

    fireEvent.press(getByTestId('feedback_button'));

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('mailto:feedback@example.test?subject=Feedback subject')
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      expect.stringContaining('Open URL - mailto:feedback@example.test')
    );
  });

  it('opens configured FAQ link', () => {
    const { getByTestId } = render(<FeedbackScreen />);

    fireEvent.press(getByTestId('feedback_faq_button'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://example.test/faq-en');
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Open URL - https://example.test/faq-en'
    );
  });

  it('does not render FAQ link when faqUrl is not configured', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'feedback') {
        return {
          email: 'feedback@example.test',
          enabled: true,
          subject: { en: 'Feedback subject' },
        };
      }
      if (key === 'settings') {
        return {
          excludeUnits: [],
          languages: ['en', 'fi'],
          markdown: {
            accessibility: false,
            aboutTheApplication: false,
            termsOfUse: false,
          },
          showUnitSettings: true,
          themes: { dark: true, light: true },
        };
      }
      return {};
    });

    const { queryByTestId } = render(<FeedbackScreen />);

    expect(queryByTestId('feedback_faq_button')).toBeNull();
  });
});

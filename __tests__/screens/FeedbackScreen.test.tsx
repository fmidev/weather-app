import './screenTestMocks';

import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import FeedbackScreen from '../../src/screens/FeedbackScreen';
import { mockTrackMatomoEvent, resetScreenMocks } from './screenTestMocks';

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
});

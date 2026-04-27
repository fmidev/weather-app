import './screenTestMocks';

import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import OthersScreen from '../../src/screens/OthersScreen';
import { resetScreenMocks } from './screenTestMocks';

describe('OthersScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  });

  it('navigates to settings, information screens and feedback', () => {
    const navigation = { navigate: jest.fn() };
    const { getByTestId } = render(
      <OthersScreen navigation={navigation as any} />
    );

    fireEvent.press(getByTestId('navigation_settings'));
    fireEvent.press(getByTestId('navigation_about'));
    fireEvent.press(getByTestId('navigation_terms_and_conditions'));
    fireEvent.press(getByTestId('navigation_accessibility'));
    fireEvent.press(getByTestId('navigation_feedback'));

    expect(navigation.navigate).toHaveBeenCalledWith('Settings');
    expect(navigation.navigate).toHaveBeenCalledWith('About');
    expect(navigation.navigate).toHaveBeenCalledWith('TermsAndConditions');
    expect(navigation.navigate).toHaveBeenCalledWith('Accessibility');
    expect(navigation.navigate).toHaveBeenCalledWith('GiveFeedback');
  });

  it('opens configured social media app link', async () => {
    const { getByLabelText } = render(
      <OthersScreen navigation={{ navigate: jest.fn() } as any} />
    );

    fireEvent.press(getByLabelText('Mastodon'));

    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith('mastodon://weather')
    );
  });
});

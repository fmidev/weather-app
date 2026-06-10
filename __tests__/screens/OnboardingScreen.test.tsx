import './screenTestMocks';

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import OnboardingScreen from '../../src/screens/OnboardingScreen';
import {
  mockChangeLanguage,
  mockSetItem,
  mockState,
  mockTrackMatomoEvent,
  resetScreenMocks,
} from './screenTestMocks';

describe('OnboardingScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('advances onboarding pages and navigates from last page', () => {
    const navigation = { navigate: jest.fn() };
    const { getByTestId } = render(
      <OnboardingScreen navigation={navigation as any} />
    );

    expect(getByTestId('onboarding_title_text').props.children).toBe(
      'weatherTitle'
    );

    fireEvent.press(getByTestId('onboarding_next_button'));
    expect(getByTestId('onboarding_title_text').props.children).toBe('mapTitle');

    fireEvent.press(getByTestId('onboarding_next_button'));
    fireEvent.press(getByTestId('onboarding_next_button'));
    fireEvent.press(getByTestId('onboarding_next_button'));

    expect(navigation.navigate).toHaveBeenCalledWith('SetupScreen');
  });

  it('navigates to setup from skip button', () => {
    const navigation = { navigate: jest.fn() };
    const { getByTestId } = render(
      <OnboardingScreen navigation={navigation as any} />
    );

    fireEvent.press(getByTestId('onboarding_skip_button'));

    expect(navigation.navigate).toHaveBeenCalledWith('SetupScreen');
  });

  it('renders language options on first page and changes language', async () => {
    mockState.language = 'fi';
    const navigation = { navigate: jest.fn() };
    const { getByTestId, queryByTestId } = render(
      <OnboardingScreen navigation={navigation as any} />
    );

    expect(getByTestId('onboarding_language_title').props.children).toBe(
      'Kieli'
    );
    expect(getByTestId('onboarding_language_options')).toBeTruthy();
    expect(getByTestId('onboarding_set_language_en')).toBeTruthy();
    expect(getByTestId('onboarding_set_language_fi')).toBeTruthy();
    expect(queryByTestId('onboarding_set_language_sv')).toBeNull();

    fireEvent.press(getByTestId('onboarding_set_language_en'));

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    await waitFor(() =>
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'User action',
        'Onboarding',
        'Select language - en'
      )
    );
    await waitFor(() => expect(mockSetItem).toHaveBeenCalledWith('locale', 'en'));

    fireEvent.press(getByTestId('onboarding_next_button'));

    expect(queryByTestId('onboarding_language_options')).toBeNull();
    expect(queryByTestId('onboarding_language_title')).toBeNull();
  });
});

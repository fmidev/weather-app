import './screenTestMocks';

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { resetScreenMocks } from './screenTestMocks';

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
});

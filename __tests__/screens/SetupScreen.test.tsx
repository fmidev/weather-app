import './screenTestMocks';

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import SetupScreen from '../../src/screens/SetupScreen';
import { mockPermissionsRequest, resetScreenMocks } from './screenTestMocks';

describe('SetupScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('continues to location permission after accepting terms', () => {
    const navigation = { navigate: jest.fn() };
    const setUpDone = jest.fn();
    const { getAllByText, getByTestId, rerender } = render(
      <SetupScreen
        navigation={navigation as any}
        route={{ params: undefined } as any}
        setUpDone={setUpDone}
        termsOfUseChanged={false}
      />
    );

    fireEvent.press(getByTestId('setup_primary_button'));
    expect(getAllByText('termsAndConditions').length).toBeGreaterThan(0);
    expect(navigation.navigate).toHaveBeenCalledWith('TermsAndConditions');

    rerender(
      <SetupScreen
        navigation={navigation as any}
        route={{ params: { acceptedTerms: true } } as any}
        setUpDone={setUpDone}
        termsOfUseChanged={false}
      />
    );

    expect(getByTestId('setup_title_text').props.children).toBe('location');

    fireEvent.press(getByTestId('setup_primary_button'));
    expect(mockPermissionsRequest).toHaveBeenCalled();
  });

  it('finishes setup after accepting changed terms of use', () => {
    const navigation = { navigate: jest.fn() };
    const setUpDone = jest.fn();
    const { getByTestId, queryByTestId, rerender } = render(
      <SetupScreen
        navigation={navigation as any}
        route={{ params: undefined } as any}
        setUpDone={setUpDone}
        termsOfUseChanged
      />
    );

    expect(queryByTestId('setup_pagination')).toBeNull();
    expect(setUpDone).not.toHaveBeenCalled();

    fireEvent.press(getByTestId('setup_primary_button'));
    expect(navigation.navigate).toHaveBeenCalledWith('TermsAndConditions');

    rerender(
      <SetupScreen
        navigation={navigation as any}
        route={{ params: { acceptedTerms: true } } as any}
        setUpDone={setUpDone}
        termsOfUseChanged
      />
    );

    expect(setUpDone).toHaveBeenCalledTimes(1);
  });
});

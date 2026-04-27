import './screenTestMocks';

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import SetupScreen from '../../src/screens/SetupScreen';
import { mockPermissionsRequest, resetScreenMocks } from './screenTestMocks';

describe('SetupScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('requires viewing terms before continuing to location permission', () => {
    const navigation = { navigate: jest.fn() };
    const setUpDone = jest.fn();
    const { getAllByText, getByTestId } = render(
      <SetupScreen
        navigation={navigation as any}
        setUpDone={setUpDone}
        termsOfUseChanged={false}
      />
    );

    fireEvent.press(getByTestId('setup_primary_button'));
    expect(getAllByText('termsAndConditions').length).toBeGreaterThan(0);

    fireEvent.press(getByTestId('setup_secondary_button'));
    expect(navigation.navigate).toHaveBeenCalledWith('TermsAndConditions');

    fireEvent.press(getByTestId('setup_primary_button'));
    expect(getByTestId('setup_title_text').props.children).toBe('location');

    fireEvent.press(getByTestId('setup_primary_button'));
    expect(mockPermissionsRequest).toHaveBeenCalled();
  });

  it('finishes setup directly when terms of use have changed and were viewed', () => {
    const setUpDone = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <SetupScreen
        navigation={{ navigate: jest.fn() } as any}
        setUpDone={setUpDone}
        termsOfUseChanged
      />
    );

    expect(queryByTestId('setup_pagination')).toBeNull();

    fireEvent.press(getByTestId('setup_secondary_button'));
    fireEvent.press(getByTestId('setup_primary_button'));

    expect(setUpDone).toHaveBeenCalledTimes(1);
  });
});

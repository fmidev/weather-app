import './screenTestMocks';

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TermsAndConditionsScreen from '../../src/screens/TermsAndConditionsScreen';
import { mockConfigGet, resetScreenMocks } from './screenTestMocks';

describe('TermsAndConditionsScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders terms content and calls accept handler', () => {
    const onAccept = jest.fn();
    const { getByTestId } = render(
      <TermsAndConditionsScreen showActions onAccept={onAccept} />
    );

    expect(getByTestId('terms_and_conditions_view')).toBeTruthy();
    fireEvent.press(getByTestId('terms_accept_button'));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('shows error message when terms are declined', () => {
    const { getByTestId, getByText } = render(
      <TermsAndConditionsScreen showActions />
    );

    fireEvent.press(getByTestId('terms_close_button'));
    expect(getByText('acceptTermsError')).toBeTruthy();
  });

  it('does not render action buttons by default', () => {
    const { queryByTestId } = render(<TermsAndConditionsScreen />);

    expect(queryByTestId('terms_accept_button')).toBeNull();
    expect(queryByTestId('terms_close_button')).toBeNull();
  });

  it('renders markdown content when enabled', () => {
    mockConfigGet.mockReturnValue({
      markdown: { termsOfUse: true },
    });

    const { getByTestId } = render(<TermsAndConditionsScreen />);

    expect(getByTestId('markdown').props.children).toBe('terms markdown en');
  });
});

import './screenTestMocks';

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TermsAndConditionsScreen from '../../src/screens/TermsAndConditionsScreen';
import { mockConfigGet, resetScreenMocks } from './screenTestMocks';

describe('TermsAndConditionsScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders terms content and calls close handler', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <TermsAndConditionsScreen showCloseButton onClose={onClose} />
    );

    expect(getByTestId('terms_and_conditions_view')).toBeTruthy();
    fireEvent.press(getByTestId('terms_close_button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders markdown content when enabled', () => {
    mockConfigGet.mockReturnValue({
      markdown: { termsOfUse: true },
    });

    const { getByTestId } = render(<TermsAndConditionsScreen />);

    expect(getByTestId('markdown').props.children).toBe('terms markdown en');
  });
});

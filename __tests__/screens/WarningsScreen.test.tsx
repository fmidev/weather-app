import './screenTestMocks';

import React from 'react';
import { render } from '@testing-library/react-native';

import WarningsScreen from '../../src/screens/WarningsScreen';
import { mockConfigGet, resetScreenMocks } from './screenTestMocks';

describe('WarningsScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('fetches and renders local warnings panel with web view fallback', () => {
    const fetchWarnings = jest.fn();
    const fetchCapWarnings = jest.fn();
    const location = { country: 'FI', id: 101, lat: 60.1, lon: 24.9 };

    const { getByTestId, queryByTestId } = render(
      <WarningsScreen
        announcements={[{ id: 'a' }] as any}
        fetchCapWarnings={fetchCapWarnings}
        fetchWarnings={fetchWarnings}
        location={location as any}
      />
    );

    expect(getByTestId('warnings_view')).toBeTruthy();
    expect(getByTestId('warnings-panel')).toBeTruthy();
    expect(getByTestId('warnings-web-view-panel').props.children).toBe(
      'interval:420000'
    );
    expect(queryByTestId('cap-warnings-view')).toBeNull();
    expect(fetchWarnings).toHaveBeenCalledWith(location);
    expect(fetchCapWarnings).not.toHaveBeenCalled();
  });

  it('uses CAP warnings when configured', () => {
    mockConfigGet.mockReturnValue({
      apiUrl: { FI: 'https://warnings.example.test' },
      enabled: true,
      useCapView: true,
    });
    const fetchWarnings = jest.fn();
    const fetchCapWarnings = jest.fn();

    const { getByTestId, queryByTestId } = render(
      <WarningsScreen
        announcements={undefined as any}
        fetchCapWarnings={fetchCapWarnings}
        fetchWarnings={fetchWarnings}
        location={{ country: 'FI', id: 101, lat: 60.1, lon: 24.9 } as any}
      />
    );

    expect(getByTestId('cap-warnings-view')).toBeTruthy();
    expect(queryByTestId('warnings-panel')).toBeNull();
    expect(fetchCapWarnings).toHaveBeenCalledTimes(1);
    expect(fetchWarnings).not.toHaveBeenCalled();
  });
});

import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { MMKV } from 'react-native-mmkv';

import { Config, ConfigProvider } from '@config';
import axiosClient from '@utils/axiosClient';
import defaultConfig from './testConfig';

jest.mock('@utils/axiosClient', () => jest.fn());
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('react-native-launch-arguments', () => {
  return {
    LaunchArguments: {
      value: jest.fn().mockReturnValue({}),
    },
  };
});

const TestComponent = () => <Text>{Config.get('weather').apiUrl}</Text>;

describe('ConfigProvider children renders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Config as any).hasBeenSet = false;
    new MMKV().clearAll();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('No api call', async () => {
    const noReloadConfig = JSON.parse(JSON.stringify(defaultConfig));
    noReloadConfig.dynamicConfig.enabled = false;
    const container = render(
      <ConfigProvider defaultConfig={noReloadConfig}>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => container.getByText('weatherApiUrl'));
    expect(container.toJSON()).toMatchObject({
      type: 'Text',
      props: {},
      children: ['weatherApiUrl'],
    });
    container.unmount();
  });

  it('Api call ( no update )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    const data = {};
    (axiosClient as jest.Mock).mockResolvedValueOnce({ data, headers: {} });

    const container = render(
      <ConfigProvider defaultConfig={config}>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => expect(axiosClient).toHaveBeenCalled());
    expect(Config.get('weather').apiUrl).toBe('weatherApiUrl');
    container.unmount();
  });

  it('Api call ( update )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    const data = { weather: { apiUrl: 'newUrl' } };
    (axiosClient as jest.Mock).mockResolvedValueOnce({ data, headers: {} });

    const container = render(
      <ConfigProvider defaultConfig={config}>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => expect(axiosClient).toHaveBeenCalled());
    await waitFor(() => expect(Config.get('weather').apiUrl).toBe('newUrl'));
    container.unmount();
  });

  it('Api call ( reject )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    (axiosClient as jest.Mock).mockRejectedValueOnce(new TypeError('Network Error'));

    const container = render(
      <ConfigProvider defaultConfig={config}>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => expect(axiosClient).toHaveBeenCalled());
    expect(Config.get('weather').apiUrl).toBe('weatherApiUrl');
    container.unmount();
  });

  it('Api call ( timeout )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    (axiosClient as jest.Mock).mockRejectedValueOnce(
      new TypeError('timeout of 1000ms exceeded')
    );

    const container = render(
      <ConfigProvider defaultConfig={config} timeout={1000}>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => expect(axiosClient).toHaveBeenCalled());
    expect(Config.get('weather').apiUrl).toBe('weatherApiUrl');
    container.unmount();
  });
});

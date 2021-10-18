import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import axios from 'axios';

import { Config, ConfigProvider } from '@config';
import defaultConfig from './testConfig';

jest.mock('axios');

const TestComponent = () => <Text>{Config.get('weather').apiUrl}</Text>;

describe('ConfigProvider children renders', () => {
  it('No api call', async () => {
    const noReloadConfig = JSON.parse(JSON.stringify(defaultConfig));
    noReloadConfig.dynamicConfig.enabled = false;
    const container = render(
      <ConfigProvider defaultConfig={noReloadConfig}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(container.toJSON()).toMatchObject({
      type: 'Text',
      props: {},
      children: ['weatherApiUrl'],
    });
  });

  it('Api call ( no update )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    const data = {};
    // @ts-ignore
    axios.get.mockImplementationOnce(() => Promise.resolve({ data }));

    const container = render(
      <ConfigProvider defaultConfig={config}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(container.toJSON()).toEqual(null);
    await waitFor(() => container.getByText('weatherApiUrl'));
    expect(container.toJSON()).toMatchObject({
      type: 'Text',
      props: {},
      children: ['weatherApiUrl'],
    });
  });

  it('Api call ( update )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    const data = { weather: { apiUrl: 'newUrl' } };
    // @ts-ignore
    axios.get.mockImplementationOnce(() => Promise.resolve({ data }));

    const container = render(
      <ConfigProvider defaultConfig={config}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(container.toJSON()).toEqual(null);
    await waitFor(() => container.getByText('newUrl'));
    expect(container.toJSON()).toMatchObject({
      type: 'Text',
      props: {},
      children: ['newUrl'],
    });
  });

  it('Api call ( reject )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    // @ts-ignore
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new TypeError('Network Error'))
    );

    const container = render(
      <ConfigProvider defaultConfig={config}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(container.toJSON()).toEqual(null);
    await waitFor(() => container.getByText('weatherApiUrl'));
    expect(container.toJSON()).toMatchObject({
      type: 'Text',
      props: {},
      children: ['weatherApiUrl'],
    });
  });

  it('Api call ( timeout )', async () => {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    // @ts-ignore
    axios.get.mockImplementationOnce(
      () =>
        new Promise((reject) => {
          const timeout = setTimeout(() => {
            clearTimeout(timeout);
            reject(new TypeError('timeout of 1000ms exceeded'));
          }, 2000);
        })
    );

    const container = render(
      <ConfigProvider defaultConfig={config} timeout={1000}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(container.toJSON()).toEqual(null);
    await waitFor(() => container.getByText('weatherApiUrl'), {
      timeout: 3000,
    });
    expect(container.toJSON()).toMatchObject({
      type: 'Text',
      props: {},
      children: ['weatherApiUrl'],
    });
  });
});

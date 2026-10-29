import React from 'react';
import { render } from '@testing-library/react-native';

import IOSWeatherStackScreen from '../../src/navigators/stacks/WeatherStackScreen.ios';

const WeatherStackScreen =
  // eslint-disable-next-line import-x/extensions -- Select the JS implementation instead of Jest's default iOS variant.
  require('../../src/navigators/stacks/WeatherStackScreen.tsx').default;

const mockNativeScreens = jest.fn();
const mockJSScreens = jest.fn();
let mockForecastItems: any[] = [];

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const { View } = require('react-native');
    return {
      Navigator: ({ children }: any) => <View>{children}</View>,
      Screen: (props: any) => {
        mockNativeScreens(props);
        const Component = props.component;
        return props.name === 'StackWeather' ? <Component /> : null;
      },
    };
  },
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => {
    const { View } = require('react-native');
    return {
      Navigator: ({ children }: any) => <View>{children}</View>,
      Screen: (props: any) => {
        mockJSScreens(props);
        return null;
      },
    };
  },
}));

jest.mock('@screens/WeatherScreen', () => {
  const ReactActual = require('react');
  const { ScreenHeaderItemsContext } = require('../../src/navigators/ScreenHeaderItemsContext');
  return () => {
    const setItems = ReactActual.useContext(ScreenHeaderItemsContext);
    ReactActual.useLayoutEffect(() => {
      setItems?.(mockForecastItems);
    }, [setItems, mockForecastItems]);
    return null;
  };
});
jest.mock('@screens/SearchScreen', () => 'SearchScreen');

describe('WeatherStackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockForecastItems = [];
  });

  const props = {
    weatherOptions: { headerShown: false },
    searchOptions: { title: 'JS search' },
    nativeWeatherOptions: { title: 'Native weather' },
    nativeSearchOptions: { title: 'Native search' },
    stackScreenListener: jest.fn(),
  };

  it('uses native weather and search headers on iOS and preserves search listeners', () => {
    render(<IOSWeatherStackScreen {...props} />);

    expect(mockNativeScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackWeather',
        options: props.nativeWeatherOptions,
      })
    );
    expect(mockNativeScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Search',
        options: props.nativeSearchOptions,
        listeners: props.stackScreenListener,
      })
    );
    expect(mockJSScreens).not.toHaveBeenCalled();
  });

  it('keeps JS headers on other platforms', () => {
    render(<WeatherStackScreen {...props} />);

    expect(mockJSScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackWeather',
        options: props.weatherOptions,
      })
    );
    expect(mockJSScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Search',
        options: props.searchOptions,
        listeners: props.stackScreenListener,
      })
    );
    expect(mockNativeScreens).not.toHaveBeenCalled();
  });

  it('appends forecast controls while preserving location controls and restores the base header', () => {
    const locationItems = [{ type: 'button', label: 'Locate' }];
    const nativeWeatherOptions = {
      unstable_headerRightItems: jest.fn(() => locationItems),
    } as any;
    mockForecastItems = [
      { type: 'button', label: 'Parameters' },
      { type: 'button', label: 'Info' },
    ];
    const view = render(
      <IOSWeatherStackScreen {...props} nativeWeatherOptions={nativeWeatherOptions} />
    );
    const weatherOptions = mockNativeScreens.mock.calls
      .filter(([screen]) => screen.name === 'StackWeather').at(-1)![0].options;
    const headerProps = { tintColor: '#123456' };
    expect(weatherOptions.unstable_headerRightItems(headerProps)).toEqual([
      ...locationItems, ...mockForecastItems,
    ]);
    expect(nativeWeatherOptions.unstable_headerRightItems).toHaveBeenCalledWith(headerProps);

    mockForecastItems = [];
    view.rerender(
      <IOSWeatherStackScreen {...props} nativeWeatherOptions={nativeWeatherOptions} />
    );
    expect(mockNativeScreens.mock.calls
      .filter(([screen]) => screen.name === 'StackWeather').at(-1)![0].options
    ).toBe(nativeWeatherOptions);
  });
});

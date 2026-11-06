import React from 'react';
import { render } from '@testing-library/react-native';

import IOSMapStackScreen from '../../src/navigators/stacks/MapStackScreen.ios';

const MapStackScreen =
  // eslint-disable-next-line import-x/extensions -- Select the JS implementation instead of Jest's default iOS variant.
  require('../../src/navigators/stacks/MapStackScreen.tsx').default;

const mockNativeScreens = jest.fn();
const mockJSScreens = jest.fn();

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const { View } = require('react-native');
    return {
      Navigator: ({ children }: any) => <View>{children}</View>,
      Screen: (props: any) => {
        mockNativeScreens(props);
        const Component = props.component;
        return props.name === 'StackMap' ? <Component /> : null;
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

jest.mock('@screens/MapScreen', () => ({
  __esModule: true,
  default: () => {
    const { View } = require('react-native');
    return <View testID="map-screen" />;
  },
}));
jest.mock('@screens/SearchScreen', () => 'SearchScreen');
jest.mock('@components/announcements/Announcements', () => ({
  __esModule: true,
  default: () => {
    const { View } = require('react-native');
    return <View testID="announcements" />;
  },
}));

describe('MapStackScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  const props = {
    mapOptions: { title: 'JS map' },
    searchOptions: { title: 'JS search' },
    nativeMapOptions: { title: 'Native map' },
    nativeSearchOptions: { title: 'Native search' },
    stackScreenListener: jest.fn(),
  };

  it('uses native map and search headers on iOS while retaining announcements and search listeners', () => {
    const view = render(<IOSMapStackScreen {...props} />);

    expect(mockNativeScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackMap',
        options: props.nativeMapOptions,
      })
    );
    expect(mockNativeScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Search',
        options: props.nativeSearchOptions,
        listeners: props.stackScreenListener,
      })
    );
    expect(view.getByTestId('map-screen')).toBeTruthy();
    expect(view.getByTestId('announcements')).toBeTruthy();
    expect(mockJSScreens).not.toHaveBeenCalled();
  });

  it('keeps JS headers on other platforms', () => {
    render(<MapStackScreen {...props} />);

    expect(mockJSScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackMap',
        options: props.mapOptions,
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
});

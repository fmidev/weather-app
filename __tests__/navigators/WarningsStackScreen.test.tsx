import React from 'react';
import { render } from '@testing-library/react-native';

import IOSWarningsStackScreen from '../../src/navigators/stacks/WarningsStackScreen.ios';

const WarningsStackScreen =
  // eslint-disable-next-line import-x/extensions -- Select the JS implementation instead of Jest's default iOS variant.
  require('../../src/navigators/stacks/WarningsStackScreen.tsx').default;

const mockNativeScreens = jest.fn();
const mockJSScreens = jest.fn();
let mockHeaderItems: any[] = [];

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const { View } = require('react-native');
    return {
      Navigator: ({ children }: any) => <View>{children}</View>,
      Screen: (props: any) => {
        mockNativeScreens(props);
        const Component = props.component;
        return props.name === 'StackWarnings' ? <Component /> : null;
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

jest.mock('@screens/WarningsScreen', () => ({
  __esModule: true,
  default: function MockWarningsScreen() {
    const ReactActual = require('react');
    const { ScreenHeaderItemsContext } = require('../../src/navigators/ScreenHeaderItemsContext');
    const setItems = ReactActual.useContext(ScreenHeaderItemsContext);
    ReactActual.useLayoutEffect(() => {
      setItems?.(mockHeaderItems);
    }, [setItems, mockHeaderItems]);
    const { View } = require('react-native');
    return <View testID="warnings-screen" />;
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

describe('WarningsStackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaderItems = [];
  });

  const props = {
    warningsOptions: { title: 'JS warnings' },
    searchOptions: { title: 'JS search' },
    nativeWarningsOptions: { title: 'Native warnings' },
    nativeSearchOptions: { title: 'Native search' },
    stackScreenListener: jest.fn(),
  };

  it('uses native warnings and search headers on iOS while retaining announcements and search listeners', () => {
    const view = render(<IOSWarningsStackScreen {...props} />);

    expect(mockNativeScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackWarnings',
        options: props.nativeWarningsOptions,
        initialParams: { day: 0 },
      })
    );
    expect(mockNativeScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Search',
        options: props.nativeSearchOptions,
        listeners: props.stackScreenListener,
      })
    );
    expect(view.getByTestId('warnings-screen')).toBeTruthy();
    expect(view.getByTestId('announcements')).toBeTruthy();
    expect(mockJSScreens).not.toHaveBeenCalled();
  });

  it('keeps JS headers on other platforms', () => {
    render(<WarningsStackScreen {...props} />);

    expect(mockJSScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackWarnings',
        options: props.warningsOptions,
        initialParams: { day: 0 },
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

  it('adds info beside location and search without changing the search header', () => {
    const locationItems = [
      { type: 'button', label: 'Locate' },
      { type: 'button', label: 'Search' },
    ];
    mockHeaderItems = [{ type: 'button', label: 'Info' }];
    render(<IOSWarningsStackScreen {...props} nativeWarningsOptions={{
      unstable_headerRightItems: () => locationItems,
    } as any} />);
    const options = mockNativeScreens.mock.calls
      .filter(([screen]) => screen.name === 'StackWarnings').at(-1)![0].options;
    expect(options.unstable_headerRightItems({})).toEqual([
      ...locationItems, ...mockHeaderItems,
    ]);
    expect(mockNativeScreens).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Search', options: props.nativeSearchOptions,
    }));
  });
});

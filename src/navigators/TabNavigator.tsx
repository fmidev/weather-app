import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import Permissions, { PERMISSIONS } from 'react-native-permissions';

import PlaceholderScreen from '../screens/PlaceHolderScreen';
import OthersScreen from '../screens/OthersScreen';
import MapScreen from '../screens/MapScreen';
import SymbolsScreen from '../screens/SymbolsScreen';
import { State } from '../store/types';
import { selectGeolocation } from '../store/general/selectors';
import { setGeolocation as setGeolocationAction } from '../store/general/actions';

import { TabParamList, OthersStackParamList } from './types';

const mapStateToProps = (state: State) => ({
  geolocation: selectGeolocation(state),
});

const mapDispatchToProps = {
  setGeolocation: setGeolocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {};

const Tab = createBottomTabNavigator<TabParamList>();
const MapStack = createStackNavigator();
const ForecastStack = createStackNavigator();
const OthersStack = createStackNavigator<OthersStackParamList>();
const WarningsStack = createStackNavigator();

const Navigator: React.FC<Props> = ({ setGeolocation }) => {
  useEffect(() => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_ALWAYS
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    Permissions.request(permission).then((result) => {
      console.log('yes to location', result);
    });
  }, []);
  useEffect(() => {
    // TODO: adjust location when moving
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GELOCATION', position);
        setGeolocation({ latitude, longitude });
      },
      (error) => {
        console.log('GEOLOCATION NOT AVAILABLE', error);
      },
      {
        // shows location indicator on iOS
        showsBackgroundLocationIndicator: true,
        // https://github.com/Agontuk/react-native-geolocation-service/blob/master/docs/accuracy.md#android
        accuracy: {
          android: 'low', // city level accuracy
          ios: 'reduced', // used when app doesn't need accurate location data
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const commonHeaderOptions = {
  //   headerStyle: {
  //     borderBottomWidth: 1,
  //   },
  //   headerTintColor: '#fff',
  //   headerTitleStyle: {
  //     fontSize: 16,
  //   },
  //   headerTitleAlign: 'center',
  // };

  const ForecastScreen = () => (
    <PlaceholderScreen
      text="Tähän tulisi havaintoa ja ennustetta"
      showLocation
      testIndex={1}
    />
  );
  const WarningsScreen = () => (
    <PlaceholderScreen text="Tänne tulisi varoitukset" testIndex={2} />
  );
  const AboutScreen = () => (
    <PlaceholderScreen
      text="Täällä lukisi tietoja sovelluksesta lyhyesti"
      testIndex={3}
    />
  );
  const SettingsScreen = () => (
    <PlaceholderScreen
      text="Täällä olisi vaikka sovelluksen yleiset asetukset"
      testIndex={4}
    />
  );

  const NotificationsScreen = () => (
    <PlaceholderScreen
      text="Täällä olisi jotain notifikaatioista"
      testIndex={6}
    />
  );

  const MapStackScreen = () => (
    <MapStack.Navigator>
      <MapStack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
    </MapStack.Navigator>
  );

  const ForecastStackScreen = () => (
    <ForecastStack.Navigator>
      <ForecastStack.Screen
        name="Forecast"
        component={ForecastScreen}
        options={{ headerShown: false }}
      />
    </ForecastStack.Navigator>
  );

  const WarningsStackScreen = () => (
    <WarningsStack.Navigator>
      <WarningsStack.Screen
        name="Warnings"
        component={WarningsScreen}
        options={{ headerShown: false }}
      />
    </WarningsStack.Navigator>
  );

  const OthersStackScreen = () => (
    <OthersStack.Navigator initialRouteName="Others">
      <OthersStack.Screen
        name="Others"
        component={OthersScreen}
        options={{ headerTitle: 'Muut' }}
      />
      <OthersStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: 'Tietoja sovelluksesta',
        }}
      />
      <OthersStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Asetukset',
        }}
      />
      <OthersStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerTitle: 'Ilmoitusasetukset' }}
      />
      <OthersStack.Screen
        name="Symbols"
        component={SymbolsScreen}
        options={{
          headerTitle: 'Symbolit',
        }}
      />
    </OthersStack.Navigator>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Map">
        <Tab.Screen
          name="Map"
          component={MapStackScreen}
          options={{
            tabBarTestID: 'navigation_map',
            tabBarLabel: 'Kartta',
            tabBarIcon: ({ color, size }) => (
              <Icon name="map-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Forecast"
          component={ForecastStackScreen}
          options={{
            tabBarTestID: 'navigation_forecast',
            tabBarLabel: 'Ennuste',
            tabBarIcon: ({ color, size }) => (
              <Icon name="partly-sunny-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Warnings"
          component={WarningsStackScreen}
          options={{
            tabBarTestID: 'navigation_warnings',
            tabBarLabel: 'Varoitukset',
            tabBarIcon: ({ color, size }) => (
              <Icon name="warning-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Others"
          component={OthersStackScreen}
          options={{
            tabBarTestID: 'navigation_others',
            tabBarLabel: 'Muut',
            tabBarIcon: ({ color, size }) => (
              <Icon name="menu-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default connector(Navigator);

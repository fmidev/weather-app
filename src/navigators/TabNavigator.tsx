import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';

import PlaceholderScreen from '../screens/PlaceHolderScreen';
import OthersScreen from '../screens/OthersScreen';
import { State } from '../store/types';
import { selectGeolocation } from '../store/general/selectors';
import { setGeolocation } from '../store/general/actions';

import { TabParamList, OthersStackParamList } from './types';

const mapStateToProps = (state: State) => {
  return {
    geolocation: selectGeolocation(state),
  };
};

const mapDispatchToProps = {
  setGeolocation,
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
    // TODO: adjust location when moving
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GELOCATION', position);
        setGeolocation({ latitude, longitude });
      },
      (error) => {
        console.error('GEOLOCATION NOT AVAILABLE', error);
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

  const MapScreen = () => <PlaceholderScreen text="Tähän tulisi kartta" />;
  const ForecastScreen = () => (
    <PlaceholderScreen
      text="Tähän tulisi havaintoa ja ennustetta"
      showLocation
    />
  );
  const WarningsScreen = () => (
    <PlaceholderScreen text="Tänne tulisi varoitukset" />
  );
  const AboutScreen = () => (
    <PlaceholderScreen text="Täällä lukisi tietoja sovelluksesta lyhyesti" />
  );
  const SettingsScreen = () => (
    <PlaceholderScreen text="Täällä olisi vaikka sovelluksen yleiset asetukset" />
  );
  const ProductScreen = () => (
    <PlaceholderScreen text="Täällä voisi olla mitä vain" />
  );
  const NotificationsScreen = () => (
    <PlaceholderScreen text="Täällä olisi jotain notifikaatioista" />
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
        name="Product"
        component={ProductScreen}
        options={{
          headerTitle: 'Tuote',
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

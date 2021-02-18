import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import PlaceholderScreen from '../screens/PlaceHolderScreen';
import OthersScreen from '../screens/OthersScreen';

const Tab = createBottomTabNavigator();
const MapStack = createStackNavigator();
const ForecastStack = createStackNavigator();
const OthersStack = createStackNavigator();
const WarningsStack = createStackNavigator();

const Navigator: React.FC = () => {
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
    <PlaceholderScreen text="Tähän tulisi havaintoa ja ennustetta" />
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

export default Navigator;

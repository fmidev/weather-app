import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'
import type { StackNavigationOptions } from '@react-navigation/stack';

import OthersScreen from '@screens/OthersScreen';
import AboutScreen from '@screens/AboutScreen';
import SettingsScreen from '@screens/SettingsScreen';
import TermsAndConditionsScreen from '@screens/TermsAndConditionsScreen';
import AccessibilityScreen from '@screens/AccessibilityScreen';
import FeedbackScreen from '@screens/FeedbackScreen';

import HeaderTitle from '@components/common/HeaderTitle';
import type { StackScreenListener, OthersStackParamList } from './types';
import { useTranslation } from 'react-i18next';

const OthersHeaderImage: React.FC<{ dark: boolean }> = ({ dark }) => (
  <Image
    source={dark ? require('@assets/images/provider-logo-dark.png') : require('@assets/images/provider-logo-light.png')}
    style={ styles.headerImage}
  />
);

type OthersStackScreenProps = {
  commonHeaderOptions: StackNavigationOptions;
  useDarkTheme: boolean;
  stackScreenListener: StackScreenListener;
};

const OthersStack = createStackNavigator<OthersStackParamList>();

const OthersStackScreen: React.FC<OthersStackScreenProps> = ({
  commonHeaderOptions,
  useDarkTheme,
  stackScreenListener,
}) => {
  const { t } = useTranslation(['navigation', 'setUp']);

  return (
    <OthersStack.Navigator initialRouteName="StackOthers">
      <OthersStack.Screen
        name="StackOthers"
        component={OthersScreen}
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <OthersHeaderImage dark={useDarkTheme} />,
        }}
      />
      <OthersStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <HeaderTitle title={t('navigation:about')} isDark={useDarkTheme} />
        }}
        listeners={stackScreenListener}
      />
      <OthersStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <HeaderTitle title={t('navigation:settings')} isDark={useDarkTheme} />
        }}
        listeners={stackScreenListener}
      />
      <OthersStack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <HeaderTitle title={t('navigation:termsAndConditions')} isDark={useDarkTheme} />
        }}
      />
      <OthersStack.Screen
        name="Accessibility"
        component={AccessibilityScreen}
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <HeaderTitle title={t('navigation:accessibility')} isDark={useDarkTheme} />
        }}
      />
      <OthersStack.Screen
        name="GiveFeedback"
        component={FeedbackScreen}
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <HeaderTitle title={t('navigation:feedback')} isDark={useDarkTheme} />
        }}
      />
    </OthersStack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    width: 180,
    height: 40,
    resizeMode: 'contain'
  }
});

export default OthersStackScreen;

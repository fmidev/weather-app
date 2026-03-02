import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import type { StackNavigationOptions } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import OnboardingScreen from '@screens/OnboardingScreen';
import SetupScreen from '@screens/SetupScreen';
import TermsAndConditionsScreen from '@screens/TermsAndConditionsScreen';

import HeaderTitle from '@components/common/HeaderTitle';

import {
  selectDidLaunchApp,
  selectTermsOfUseAccepted,
} from '@store/navigation/selectors';
import {
  setDidLaunchApp as setDidLaunchAppAction,
} from '@store/navigation/actions';
import { State } from '@store/types';

const SetupStack = createStackNavigator();

const mapStateToProps = (state: State) => ({
  didLaunchApp: selectDidLaunchApp(state),
  termsOfUseAccepted: selectTermsOfUseAccepted(state),
});

const mapDispatchToProps = {
  setDidLaunchApp: setDidLaunchAppAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SetupStackScreenProps = PropsFromRedux & {
  commonHeaderOptions: StackNavigationOptions;
  useDarkTheme: boolean;
};

const SetupStackScreen: React.FC<SetupStackScreenProps> = ({
  didLaunchApp,
  termsOfUseAccepted,
  commonHeaderOptions,
  useDarkTheme,
  setDidLaunchApp,
}) => {
  const { t } = useTranslation(['navigation', 'setUp']);

  return (
    <SetupStack.Navigator
      initialRouteName={didLaunchApp && !termsOfUseAccepted ? 'SetupScreen' : 'Onboarding'}
      screenOptions={{ gestureEnabled: false }}>
      <SetupStack.Screen
        name="Onboarding"
        options={{ headerShown: false }}
        component={OnboardingScreen}
      />
      <SetupStack.Screen
        name="SetupScreen"
        options={{
          headerShown: false,
        }}>
        {(props) => (
          <SetupScreen
            {...props}
            setUpDone={setDidLaunchApp}
            termsOfUseChanged={!termsOfUseAccepted}
          />
        )}
      </SetupStack.Screen>
      <SetupStack.Screen
        name="TermsAndConditions"
        options={{
          ...commonHeaderOptions,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => <HeaderTitle title={t('setUp:termsAndConditions')} isDark={useDarkTheme} />
        }}>
        {({ navigation }) => (
          <TermsAndConditionsScreen
            showCloseButton
            onClose={() => navigation.goBack()}
          />
        )}
      </SetupStack.Screen>
    </SetupStack.Navigator>
  );
};

export default connector(SetupStackScreen);

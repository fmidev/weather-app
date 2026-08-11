import React from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider, useSelector } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import ReduxThunk from 'redux-thunk';
import NetInfo from '@react-native-community/netinfo';

import '@i18n';
import '@utils/moment';
import { ConfigProvider } from '@config';
import reducers from './src/store';
import TabNavigator from './src/navigators/TabNavigator';
import { configureMapLibreLogging } from '@utils/map';
import { isRunningInIOSCompatibilityMode } from '@utils/iosCompatibilityMode';
import { setIsRunningOnMac } from '@store/settings/actions';
import { selectIsRunningOnMac } from '@store/settings/selectors';
import { MacContentSizeProvider } from '@components/common/MacContentSizeContext';
import defaultConfig from './defaultConfig';

const AppContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isRunningOnMac = useSelector(selectIsRunningOnMac);

  return (
    <MacContentSizeProvider isRunningOnMac={isRunningOnMac}>
      {children}
    </MacContentSizeProvider>
  );
};

const App: React.FC = () => {
  const composeEnhancers = compose;

  const store = React.useMemo(
    () =>
      createStore(
        reducers,
        {},
        composeEnhancers(applyMiddleware(ReduxThunk))
      ),
    [composeEnhancers]
  );

  const persistor = React.useMemo(() => persistStore(store), [store]);

  React.useEffect(() => {
    isRunningInIOSCompatibilityMode()
      .then((isRunningOnMac) => {
        setIsRunningOnMac(isRunningOnMac)(store.dispatch);
      })
      .catch(() => {
        setIsRunningOnMac(false)(store.dispatch);
      });
  }, [store]);

  NetInfo.configure({
    reachabilityShouldRun: () => false,
  });

  configureMapLibreLogging();

  return (
    <Provider store={store}>
      <AppContent>
        <PersistGate loading={null} persistor={persistor}>
          <ConfigProvider defaultConfig={defaultConfig}>
            <TabNavigator />
          </ConfigProvider>
        </PersistGate>
      </AppContent>
    </Provider>
  );
};

export default App;

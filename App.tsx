import React from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider, useSelector } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import ReduxThunk from 'redux-thunk';

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

type AppContentProps = React.PropsWithChildren<{
  isPlatformDetectionComplete: boolean;
}>;

const AppContent: React.FC<AppContentProps> = ({
  children,
  isPlatformDetectionComplete,
}) => {
  const isRunningOnMac = useSelector(selectIsRunningOnMac);

  return (
    <MacContentSizeProvider
      isRunningOnMac={isRunningOnMac}
      isPlatformDetectionComplete={isPlatformDetectionComplete}>
      {children}
    </MacContentSizeProvider>
  );
};

const App: React.FC = () => {
  const composeEnhancers = compose;
  const [isPlatformDetectionComplete, setIsPlatformDetectionComplete] =
    React.useState(false);

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
    let isActive = true;

    const detectPlatform = async () => {
      let isRunningOnMac = false;
      try {
        isRunningOnMac = await isRunningInIOSCompatibilityMode();
      } catch (error) {
        console.error('Failed to detect iOS compatibility mode:', error);
      }

      if (isActive) {
        setIsRunningOnMac(isRunningOnMac)(store.dispatch);
        setIsPlatformDetectionComplete(true);
      }
    };

    detectPlatform();

    return () => {
      isActive = false;
    };
  }, [store]);

  configureMapLibreLogging();

  return (
    <Provider store={store}>
      <AppContent
        isPlatformDetectionComplete={isPlatformDetectionComplete}>
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

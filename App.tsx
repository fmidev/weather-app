import React from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import ReduxThunk from 'redux-thunk';
import NetInfo from '@react-native-community/netinfo';
import '@i18n';
import { ConfigProvider } from '@config';
import reducers from './src/store';
import TabNavigator from './src/navigators/TabNavigator';

import defaultConfig from './defaultConfig';

const App: React.FC = () => {
  const composeEnhancers =
    (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const store = createStore(
    reducers,
    {},
    composeEnhancers(applyMiddleware(ReduxThunk))
  );

  const persistor = persistStore(store);

  NetInfo.configure({
    reachabilityShouldRun: () => false,
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider defaultConfig={defaultConfig}>
          <TabNavigator />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

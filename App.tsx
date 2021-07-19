import 'react-native-gesture-handler';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import './i18n';
import { Appearance } from 'react-native';

import reducers from './src/store';
import TabNavigator from './src/navigators/TabNavigator';

const App: React.FC = () => {
  const composeEnhancers =
    (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const store = createStore(
    reducers,
    {},
    composeEnhancers(applyMiddleware(ReduxThunk))
  );

  const initialColorScheme = Appearance.getColorScheme();

  return (
    <Provider store={store}>
      <TabNavigator initialColorScheme={initialColorScheme} />
    </Provider>
  );
};

export default App;

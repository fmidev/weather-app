import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import WarningsScreen from '@screens/WarningsScreen';
import warningsReducer from '@store/warnings/reducer';
import locationReducer from '@store/location/reducer';
import settingsReducer from '@store/settings/reducer';
import { RESET_AUTOCOMPLETE } from '@store/location/types';
import { ReloaderContext } from '@utils/reloader';
import { mockRoute, mockRouteContext } from './weatherScreenNativeMocks';

const rootReducer = combineReducers({
  warnings: warningsReducer,
  location: locationReducer,
  settings: settingsReducer,
});

export const mountWarningsScreen = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  store.dispatch({ type: RESET_AUTOCOMPLETE });
  const screen = (shouldReload = 0) => (
    <Provider store={store}>
      <ReloaderContext.Provider value={{ shouldReload }}>
        <mockRouteContext.Provider value={{ params: { ...mockRoute.params } }}>
          <WarningsScreen />
        </mockRouteContext.Provider>
      </ReloaderContext.Provider>
    </Provider>
  );
  const view = render(screen());
  return { store, view, reload: () => view.rerender(screen(Date.now())) };
};

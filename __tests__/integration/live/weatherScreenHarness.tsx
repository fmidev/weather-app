import React from 'react';
import { ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import WeatherScreen from '@screens/WeatherScreen';
import forecastReducer from '@store/forecast/reducer';
import observationReducer from '@store/observation/reducer';
import locationReducer from '@store/location/reducer';
import settingsReducer from '@store/settings/reducer';
import warningsReducer from '@store/warnings/reducer';
import meteorologistReducer from '@store/meteorologist/reducer';
import newsReducer from '@store/news/reducer';
import announcementsReducer from '@store/announcements/reducer';
import { RESET_AUTOCOMPLETE } from '@store/location/types';
import { ReloaderContext } from '@utils/reloader';

const rootReducer = combineReducers({
  forecast: forecastReducer,
  observation: observationReducer,
  location: locationReducer,
  settings: settingsReducer,
  warnings: warningsReducer,
  meteorologist: meteorologistReducer,
  news: newsReducer,
  announcements: announcementsReducer,
});

export const mountScreen = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  // Give memoized location selectors a fresh domain for each configuration.
  store.dispatch({ type: RESET_AUTOCOMPLETE });
  let observationTop = 1000;
  const screen = (shouldReload = 0) => (
    <Provider store={store}>
      <ReloaderContext.Provider value={{ shouldReload }}>
        <WeatherScreen />
      </ReloaderContext.Provider>
    </Provider>
  );
  const view = render(screen());
  // React Native's Jest host methods do not invoke measurement callbacks.
  // Supply native coordinates while retaining WeatherScreen's visibility logic.
  view.UNSAFE_getByType(ScrollView).instance.measure.mockImplementation(
    (callback: (...values: number[]) => void) => callback(0, 0, 390, 800, 0, 0)
  );
  const observationView = view.getByTestId('weather_view').findAll(
    (node) => node.props.collapsable === false && typeof node.instance?.measure === 'function'
  )[0];
  observationView?.instance.measure.mockImplementation(
    (callback: (...values: number[]) => void) => callback(0, 0, 390, 300, 0, observationTop)
  );
  const scrollToObservations = () => {
    observationTop = 400;
    fireEvent.scroll(view.getByTestId('weather_scrollview'), {
      nativeEvent: { layoutMeasurement: { height: 800 } },
    });
  };
  return { store, view, scrollToObservations, reload: () => view.rerender(screen(Date.now())) };
};

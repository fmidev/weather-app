import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import SearchScreen from '@screens/SearchScreen';
import locationReducer from '@store/location/reducer';
import mapReducer from '@store/map/reducer';
import { RESET_AUTOCOMPLETE } from '@store/location/types';

const rootReducer = combineReducers({
  location: locationReducer,
  map: mapReducer,
});

export const mountSearchScreen = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  store.dispatch({ type: RESET_AUTOCOMPLETE });
  const navigation = { goBack: jest.fn() };
  const view = render(
    <Provider store={store}>
      <SearchScreen navigation={navigation as unknown as React.ComponentProps<typeof SearchScreen>['navigation']} />
    </Provider>
  );
  return { store, view, navigation };
};

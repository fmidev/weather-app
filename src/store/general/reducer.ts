import {
  SET_GEOLOCATION,
  SET_CURRENT_LOCATION,
  GeneralActionTypes,
  GeneralState,
} from './types';

const INITIAL_STATE: GeneralState = {
  geolocation: undefined,
  currentLocation: undefined,
  isGeolocation: undefined,
};

export default (
  state = INITIAL_STATE,
  action: GeneralActionTypes
): GeneralState => {
  switch (action.type) {
    case SET_GEOLOCATION:
      return {
        ...state,
        geolocation: action.geolocation,
      };

    case SET_CURRENT_LOCATION: {
      return {
        ...state,
        currentLocation: action.location,
        isGeolocation: action.isGeolocation,
      };
    }

    default: {
      return state;
    }
  }
};

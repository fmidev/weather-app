import {
  SET_GEOLOCATION,
  SET_ACTIVE_LOCATION,
  GeneralActionTypes,
  GeneralState,
} from './types';

const INITIAL_STATE: GeneralState = {
  geolocation: undefined,
  activeLocation: undefined,
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

    case SET_ACTIVE_LOCATION:
      return {
        ...state,
        activeLocation: action.location,
      };

    default: {
      return state;
    }
  }
};

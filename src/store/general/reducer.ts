import { SET_GEOLOCATION, GeneralActionTypes, GeneralState } from './types';

const INITIAL_STATE: GeneralState = {
  geolocation: undefined,
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

    default: {
      return state;
    }
  }
};

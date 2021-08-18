import moment from 'moment';
import {
  UPDATE_MAP_LAYERS,
  UPDATE_SLIDER_TIME,
  UPDATE_SLIDER_STEP,
  ANIMATE_TO_AREA,
  MapActionTypes,
  MapState,
} from './types';

const INITIAL_STATE: MapState = {
  mapLayers: {
    location: false,
    weather: true,
    radar: false,
  },
  sliderTime: moment.utc().startOf('hour').unix(),
  sliderStep: 60,
  animateToArea: false,
};

export default (state = INITIAL_STATE, action: MapActionTypes): MapState => {
  switch (action.type) {
    case UPDATE_SLIDER_TIME: {
      return {
        ...state,
        sliderTime: action.time,
      };
    }

    case UPDATE_SLIDER_STEP: {
      return {
        ...state,
        sliderStep: action.step,
      };
    }

    case UPDATE_MAP_LAYERS: {
      return {
        ...state,
        mapLayers: action.layers,
      };
    }

    case ANIMATE_TO_AREA: {
      return {
        ...state,
        animateToArea: action.animate,
      };
    }
    default: {
      return state;
    }
  }
};

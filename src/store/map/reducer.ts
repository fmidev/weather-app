import moment from 'moment';
import {
  UPDATE_MAP_LAYERS,
  UPDATE_SLIDER_TIME,
  UPDATE_SLIDER_STEP,
  ANIMATE_TO_AREA,
  INITIALIZE_OVERLAYS,
  MapActionTypes,
  MapState,
  UPDATE_ACTIVE_OVERLAY,
  UPDATE_IS_OBSERVATION,
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
  overlays: undefined,
  activeOverlay: 0,
  isObservation: false,
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

    case INITIALIZE_OVERLAYS: {
      return {
        ...state,
        overlays: action.overlays,
      };
    }

    case UPDATE_ACTIVE_OVERLAY: {
      return {
        ...state,
        activeOverlay: action.activeId,
      };
    }

    case UPDATE_IS_OBSERVATION: {
      return {
        ...state,
        isObservation: action.value,
      };
    }

    default: {
      return state;
    }
  }
};

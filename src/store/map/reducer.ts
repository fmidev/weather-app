import { PersistConfig } from '@store/types';
import moment from 'moment';
import {
  UPDATE_MAP_LAYERS,
  UPDATE_SLIDER_TIME,
  UPDATE_SLIDER_STEP,
  ANIMATE_TO_AREA,
  UPDATE_OVERLAYS,
  MapActionTypes,
  MapState,
  UPDATE_ACTIVE_OVERLAY,
} from './types';

const INITIAL_STATE: MapState = {
  mapLayers: {
    location: true,
    weather: true,
    radar: false,
  },
  sliderTime: moment.utc().startOf('hour').unix(),
  sliderStep: undefined,
  animateToArea: false,
  overlays: undefined,
  activeOverlay: undefined,
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

    case UPDATE_OVERLAYS: {
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

    default: {
      return state;
    }
  }
};
export const mapPersist: PersistConfig = {
  key: 'map',
  whitelist: ['activeOverlay', 'sliderStep', 'mapLayers'],
};

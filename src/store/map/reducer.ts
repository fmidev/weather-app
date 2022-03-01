import { PersistConfig } from '@store/types';
import {
  UPDATE_MAP_LAYERS,
  UPDATE_SLIDER_TIME,
  UPDATE_SLIDER_STEP,
  ANIMATE_TO_AREA,
  UPDATE_OVERLAYS,
  MapActionTypes,
  MapState,
  UPDATE_ACTIVE_OVERLAY,
  UPDATE_REGION,
} from './types';

const INITIAL_STATE: MapState = {
  mapLayers: {
    location: true,
    weather: true,
    radar: false,
  },
  sliderTime: 0,
  sliderStep: undefined,
  animateToArea: false,
  overlays: undefined,
  activeOverlay: undefined,
  region: { latitude: 0, longitude: 0, longitudeDelta: 0, latitudeDelta: 0 },
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

    case UPDATE_REGION: {
      return {
        ...state,
        region: action.region,
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

import { PersistConfig } from '@store/types';
import {
  UPDATE_MAP_LAYERS,
  UPDATE_SLIDER_TIME,
  ANIMATE_TO_AREA,
  UPDATE_OVERLAYS,
  UPDATE_OVERLAYS_SUCCESS,
  UPDATE_OVERLAYS_ERROR,
  MapActionTypes,
  MapState,
  UPDATE_ACTIVE_OVERLAY,
  UPDATE_REGION,
  UPDATE_SELECTED_CALLOUT,
  UPDATE_ANIMATION_SPEED,
  UPDATE_ZOOM_LEVEL,
} from './types';

const INITIAL_STATE: MapState = {
  mapLayers: {
    location: true,
    weather: true,
    radar: false,
  },
  animationSpeed: 80,
  sliderTime: 0,
  animateToArea: false,
  overlays: undefined,
  overlaysError: false,
  activeOverlay: undefined,
  region: { latitude: 0, longitude: 0, longitudeDelta: 0, latitudeDelta: 0 },
  zoomLevel: 8,
  selectedCallout: undefined,
};

export default (state = INITIAL_STATE, action: MapActionTypes): MapState => {
  switch (action.type) {
    case UPDATE_SLIDER_TIME: {
      return {
        ...state,
        sliderTime: action.time,
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
        overlaysError: false,
      };
    }

    case UPDATE_OVERLAYS_SUCCESS: {
      return {
        ...state,
        overlays: action.overlays,
        sliderTime: 0,
      };
    }

    case UPDATE_OVERLAYS_ERROR: {
      return {
        ...state,
        overlays: undefined,
        overlaysError: action.error,
        sliderTime: 0,
      };
    }

    case UPDATE_ACTIVE_OVERLAY: {
      return {
        ...state,
        activeOverlay: action.activeId,
        sliderTime: 0,
      };
    }

    case UPDATE_REGION: {
      return {
        ...state,
        region: action.region,
      };
    }

    case UPDATE_SELECTED_CALLOUT: {
      return {
        ...state,
        selectedCallout: action.selectedCallout,
      };
    }

    case UPDATE_ANIMATION_SPEED: {
      return {
        ...state,
        animationSpeed: action.speed,
      };
    }

    case UPDATE_ZOOM_LEVEL: {
      return {
        ...state,
        zoomLevel: action.level,
      };
    }

    default: {
      return state;
    }
  }
};
export const mapPersist: PersistConfig = {
  key: 'map',
  whitelist: ['activeOverlay', 'mapLayers', 'animationSpeed'],
};

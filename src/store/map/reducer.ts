import { PersistConfig } from '@store/types';
import {
  UPDATE_MAP_LAYERS,
  UPDATE_SLIDER_TIME,
  ANIMATE_TO_AREA,
  UPDATE_OVERLAYS,
  UPDATE_OVERLAYS_SUCCESS,
  UPDATE_OVERLAYS_ERROR,
  Layer,
  MapActionTypes,
  MapOverlay,
  MapState,
  TimeseriesLayer,
  UPDATE_ACTIVE_OVERLAY,
  UPDATE_REGION,
  UPDATE_SELECTED_CALLOUT,
  UPDATE_ANIMATION_SPEED,
} from './types';

const areLayerStylesEqual = (first: Layer['styles'], second: Layer['styles']) =>
  typeof first === 'string' || typeof second === 'string'
    ? first === second
    : first.dark === second.dark && first.light === second.light;

const areLayersEqual = (first?: Layer, second?: Layer) => {
  if (first === second) return true;
  if (!first || !second) return false;

  return (
    first.url === second.url &&
    first.start === second.start &&
    first.end === second.end &&
    areLayerStylesEqual(first.styles, second.styles)
  );
};

const areTimeseriesLayersEqual = (
  first?: TimeseriesLayer,
  second?: TimeseriesLayer
) => {
  if (first === second) return true;
  if (!first || !second) return false;

  return first.start === second.start && first.end === second.end;
};

const areOverlayMapsEqual = (
  current: Map<number, MapOverlay> | undefined,
  next: Map<number, MapOverlay>
) => {
  if (!current || current.size !== next.size) return false;

  return [...next.entries()].every(([id, nextOverlay]) => {
    const currentOverlay = current.get(id);
    if (!currentOverlay || currentOverlay.type !== nextOverlay.type) {
      return false;
    }

    if (currentOverlay.type === 'Timeseries') {
      return (
        Boolean(currentOverlay.etag) &&
        currentOverlay.etag === nextOverlay.etag &&
        currentOverlay.step === nextOverlay.step &&
        areTimeseriesLayersEqual(
          currentOverlay.observation as TimeseriesLayer | undefined,
          nextOverlay.observation as TimeseriesLayer | undefined
        ) &&
        areTimeseriesLayersEqual(
          currentOverlay.forecast as TimeseriesLayer | undefined,
          nextOverlay.forecast as TimeseriesLayer | undefined
        )
      );
    }

    return (
      currentOverlay.step === nextOverlay.step &&
      currentOverlay.tileSize === nextOverlay.tileSize &&
      areLayersEqual(
        currentOverlay.observation as Layer | undefined,
        nextOverlay.observation as Layer | undefined
      ) &&
      areLayersEqual(
        currentOverlay.forecast as Layer | undefined,
        nextOverlay.forecast as Layer | undefined
      )
    );
  });
};

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
      if (state.overlaysError === false) return state;

      return {
        ...state,
        overlaysError: false,
      };
    }

    case UPDATE_OVERLAYS_SUCCESS: {
      if (areOverlayMapsEqual(state.overlays, action.overlays)) return state;

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

    default: {
      return state;
    }
  }
};
export const mapPersist: PersistConfig = {
  key: 'map',
  whitelist: ['activeOverlay', 'mapLayers', 'animationSpeed'],
};

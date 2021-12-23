import { Config } from '@config';
import { State } from '@store/types';
import { createSelector, Selector } from 'reselect';
import { LocationState } from './types';

const selectLocationDomain: Selector<State, LocationState> = (state) =>
  state.location;

export const selectGeolocation = createSelector(
  selectLocationDomain,
  (location) => location.geolocation
);

export const selectIsGeolocation = createSelector(
  selectLocationDomain,
  (location) => location.isGeolocation
);

export const selectCurrent = createSelector(
  selectLocationDomain,
  (location) => location.current || Config.get('location').default
);

export const selectGeoid = createSelector(
  [selectCurrent],
  (location) => location.id
);

export const selectTimeZone = createSelector(
  [selectCurrent],
  (location) => location.timezone
);

export const selectRecent = createSelector(
  selectLocationDomain,
  (location) => location.recent
);

export const selectFavorites = createSelector(
  selectLocationDomain,
  (location) => location.favorites
);

export const selectSearch = createSelector(
  selectLocationDomain,
  (location) => location.search
);

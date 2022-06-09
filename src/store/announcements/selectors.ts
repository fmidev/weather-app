import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { AnnouncementsState } from './types';

const selectAnnouncementsDomain: Selector<State, AnnouncementsState> = (
  state
) => state.announcements;

export const selectLoading = createSelector(
  selectAnnouncementsDomain,
  (announcements) => announcements.loading
);

export const selectError = createSelector(
  selectAnnouncementsDomain,
  (announcements) => announcements.error
);

export const selectAnnouncements = createSelector(
  selectAnnouncementsDomain,
  (announcements) => announcements.data
);

export const selectCrisis = createSelector(
  selectAnnouncements,
  (announcements) =>
    announcements &&
    announcements.length > 0 &&
    announcements.filter((a) => a.type === 'Crisis')[0]
);

export const selectMaintenance = createSelector(
  selectAnnouncements,
  (announcements) =>
    announcements &&
    announcements.length > 0 &&
    announcements.filter((a) => a.type === 'Maintenance')[0]
);

export const selectFetchTimestamp = createSelector(
  selectAnnouncementsDomain,
  (announcements) => announcements.fetchTimestamp
);

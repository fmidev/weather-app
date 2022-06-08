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
  (announcements) => announcements.filter((a) => a.type === 'Crisis')
);

export const selectFetchTimestamp = createSelector(
  selectAnnouncementsDomain,
  (announcements) => announcements.fetchTimestamp
);

export const selectAnnouncementsAge = createSelector(
  selectAnnouncementsDomain,
  (announcements) => Date.now() - announcements.fetchSuccessTime
);

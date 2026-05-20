import { PersistConfig } from '@store/types';
import {
  AnnouncementsState,
  AnnouncementActionTypes,
  FETCH_ANNOUNCEMENTS,
  FETCH_ANNOUNCEMENTS_SUCCESS,
  FETCH_ANNOUNCEMENTS_ERROR,
  DISMISS_ANNOUNCEMENT,
} from './types';

const INITIAL_STATE: AnnouncementsState = {
  data: [],
  dismissed: [],
  loading: false,
  error: false,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

export default (
  state = INITIAL_STATE,
  action: AnnouncementActionTypes
): AnnouncementsState => {
  switch (action.type) {
    case FETCH_ANNOUNCEMENTS: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_ANNOUNCEMENTS_SUCCESS: {
      return {
        ...state,
        loading: false,
        error: false,
        data: action.data,
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
      };
    }

    case FETCH_ANNOUNCEMENTS_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
        fetchTimestamp: action.timestamp,
      };
    }

    case DISMISS_ANNOUNCEMENT: {
      return {
        ...state,
        data: state.data.filter((announcement) => announcement.id !== action.id),
        dismissed: [...state.dismissed, action.id],
      };
    }

    default: {
      return state;
    }
  }
};

export const announcementsPersist: PersistConfig = {
  key: 'announcements',
  whitelist: ['dismissed'],
};

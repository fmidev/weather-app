import { Dispatch } from 'react';
import getAnnouncements from '@network/AnnouncementsApi';
import {
  Error,
  FETCH_ANNOUNCEMENTS,
  FETCH_ANNOUNCEMENTS_SUCCESS,
  FETCH_ANNOUNCEMENTS_ERROR,
  AnnouncementActionTypes,
} from './types';

const fetchAnnouncements =
  () => (dispatch: Dispatch<AnnouncementActionTypes>) => {
    dispatch({ type: FETCH_ANNOUNCEMENTS });

    getAnnouncements()
      .then((data) => {
        dispatch({
          type: FETCH_ANNOUNCEMENTS_SUCCESS,
          data,
          timestamp: Date.now(),
        });
      })
      .catch((error: Error) => {
        dispatch({
          type: FETCH_ANNOUNCEMENTS_ERROR,
          error,
          timestamp: Date.now(),
        });
      });
  };

export default fetchAnnouncements;
export { fetchAnnouncements };

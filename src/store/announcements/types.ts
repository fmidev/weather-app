export const FETCH_ANNOUNCEMENTS = 'FETCH_ANNOUNCEMENTS';
export const FETCH_ANNOUNCEMENTS_SUCCESS = 'FETCH_ANNOUNCEMENTS_SUCCESS';
export const FETCH_ANNOUNCEMENTS_ERROR = 'FETCH_ANNOUNCEMENTS_ERROR';

interface FetchAnnouncements {
  type: typeof FETCH_ANNOUNCEMENTS;
}

interface FetchAnnouncementsSuccess {
  type: typeof FETCH_ANNOUNCEMENTS_SUCCESS;
  data: Announcement[];
  timestamp: number;
}

interface FetchAnnouncementsError {
  type: typeof FETCH_ANNOUNCEMENTS_ERROR;
  error: Error;
  timestamp: number;
}

export type AnnouncementActionTypes =
  | FetchAnnouncements
  | FetchAnnouncementsSuccess
  | FetchAnnouncementsError;

export interface Announcement {
  type: 'Maintenance' | 'Crisis';
  content: string;
  link: string;
}

export interface Error {
  code: number;
  message: string;
}

export interface AnnouncementsState {
  data: Announcement[];
  loading: boolean;
  error: boolean | Error | string;
  fetchTimestamp: number;
  fetchSuccessTime: number;
}

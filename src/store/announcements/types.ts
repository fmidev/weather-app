export const FETCH_ANNOUNCEMENTS = 'FETCH_ANNOUNCEMENTS';
export const FETCH_ANNOUNCEMENTS_SUCCESS = 'FETCH_ANNOUNCEMENTS_SUCCESS';
export const FETCH_ANNOUNCEMENTS_ERROR = 'FETCH_ANNOUNCEMENTS_ERROR';
export const DISMISS_ANNOUNCEMENT = 'DISMISS_ANNOUNCEMENT';

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

interface DismissAnnouncement {
  type: typeof DISMISS_ANNOUNCEMENT;
  id: string;
}

export type AnnouncementActionTypes =
  | FetchAnnouncements
  | FetchAnnouncementsSuccess
  | FetchAnnouncementsError
  | DismissAnnouncement;

export interface Announcement {
  id: string;
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
  dismissed: string[]; // Array of dismissed announcement IDs
  loading: boolean;
  error: boolean | Error | string;
  fetchTimestamp: number;
  fetchSuccessTime: number;
}

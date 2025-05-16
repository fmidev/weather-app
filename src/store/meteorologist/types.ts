interface MeteorologistSnapshot {
  title: string;
  text: string;
  hasAlert: boolean;
  date: string;
}

export interface AnnouncementsState {
  data: MeteorologistSnapshot;
  loading: boolean;
  error: boolean | Error | string;
  fetchTimestamp: number;
  fetchSuccessTime: number;
}
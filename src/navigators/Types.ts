export type TabParamList = {
  Map: undefined;
  Forecast: undefined;
  Warnings: undefined;
  Others: undefined;
};

export type OthersStackParamList = {
  Others: undefined;
  About: undefined;
  Settings: undefined;
  Notifications: undefined;
  Symbols: undefined;
};

type Location = {
  name: string;
  area: string;
  lat: number;
  lon: number;
  id: number;
};

export type MapStackParamList = {
  Map: Location;
  Search: undefined;
};

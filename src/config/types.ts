import { Location } from '@store/location/types';
import { DisplayParameters, ForecastParameters } from '@store/forecast/types';
import {
  ObservationParameters,
  DailyObservationParameters,
} from '@store/observation/types';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

type BaseTimes = {
  timeStep: number;
  observation?: number;
  forecast?: number;
};

export type WMSSource = {
  source: string;
  layer: string;
  type: 'observation' | 'forecast';
  customParameters?: {
    [name: string]: string | number | { dark: string; light: string };
  };
};

export type TimeseriesSource = {
  source: string;
  type: 'observation' | 'forecast';
  parameters: string[];
  producer?: string;
  keyword: string | string[];
};

type Times = RequireAtLeastOne<BaseTimes, 'forecast' | 'observation'>;

type PlatformSpecificNumber = {
  ios: number;
  android: number;
  // To be able to use Platform.OS in TS, we need to add the following:
  windows?: number;
  macos?: number;
  web?: number;
};

export interface MapLayer {
  id: number;
  type: 'WMS' | 'GeoJSON' | 'Timeseries';
  name: { [lang: string]: string };
  legend?: {
    hasPrecipitationFin?: boolean;
    hasPrecipitationScan?: boolean;
    hasLightning15?: boolean;
    hasLightning60?: boolean;
    hasWindArrowsShort?: boolean;
    hasWindArrowsLong?: boolean;
    hasTemperatureShort?: boolean;
    hasTemperatureLong?: boolean;
  };
  sources: WMSSource[] | TimeseriesSource[];
  times: Times;
  tileSize?: number | PlatformSpecificNumber;
  tileFormat?: string;
}

interface GeoMagneticObservations {
  enabled: boolean;
  producer: string;
  countryCodes: string[];
}

interface Observation {
  updateInterval: number;
  numberOfStations: number;
  producer: string | { default: string; [name: string]: string };
  dailyProducers?: string[];
  timePeriod: number;
  parameters: (keyof ObservationParameters)[];
  dailyParameters?: (keyof DailyObservationParameters)[];
  geoMagneticObservations?: GeoMagneticObservations;
  lazyLoad?: boolean;
}

interface ObservationEnabled extends Observation {
  enabled: true;
}

interface ObservationDisabled extends Partial<Observation> {
  enabled: false;
}
interface CapDataSource {
  id: number;
  url: string;
  urlIcons: string;
}
interface CapViewSettings {
  mapHeight?: number;
  numberOfDays: number;
  datasources: CapDataSource[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mapZoomEnabled?: boolean;
  mapScrollEnabled?: boolean;
  mapToolbarEnabled?: boolean;
  includeAreaInTitle?: boolean;
}

interface Warnings {
  apiUrl: {
    [country: string]: string;
  };
  useCapView?: boolean;
  updateInterval: number;
  ageWarning?: number;
  webViewUrl?: string;
  capViewSettings?: CapViewSettings;
}

interface WarningsEnabled extends Warnings {
  enabled: true;
}

interface WarningsDisabled extends Partial<Warnings> {
  enabled: false;
}

interface Announcements {
  updateInterval: number;
  api: {
    [locale: string]: string;
  };
}
interface AnnouncementsEnabled extends Announcements {
  enabled: true;
}

interface AnnouncementsDisabled extends Partial<Announcements> {
  enabled: false;
}

interface DynamicConfig {
  readonly apiUrl: string;
  interval: number;
}

interface DynamicConfigEnabled extends DynamicConfig {
  enabled: true;
}

interface DynamicConfigDisabled extends Partial<DynamicConfig> {
  enabled: false;
}

interface SocialMediaLink {
  name: string;
  icon: string;
  appUrl: string;
  url: string;
}

interface UnresolvedGeoIdErrorMessage {
  [language: string]: {
    title: string;
    additionalInfo?: string;
  };
}

interface LightThemeEnabled {
  light: true;
  dark: boolean;
}
interface DarkThemeEnabled {
  light: boolean;
  dark: true;
}

type Themes = LightThemeEnabled | DarkThemeEnabled;

interface OnboardingWizard {
  enabled: boolean;
  languageSpecificLogo?: boolean;
  termsOfUseChanged?: boolean;
}

interface Feedback {
  enabled: boolean;
  email: string;
  subject: {
    [locale: string]: string;
  };
}

interface News {
  apiUrl: {
    [country: string]: string;
  };
  numberOfNews: number;
  updateInterval: number;
  outdated: number;
}

interface NewsEnabled extends News {
  enabled: true;
}

interface NewsDisabled extends Partial<News> {
  enabled: false;
}

interface MeteorologistSnapshotConfig {
  url: string;
  updateInterval: number;
}

export interface ConfigType {
  dynamicConfig: DynamicConfigEnabled | DynamicConfigDisabled;
  location: {
    default: Location;
    apiUrl: string;
    keyword: string;
    maxRecent: number;
    maxFavorite: number;
  };
  map: {
    // latitudeDelta: number;
    updateInterval: number;
    sources: { [name: string]: string };
    layers: MapLayer[];
  };
  weather: {
    apiUrl: string;
    layout?: 'default' | 'fmi' | 'legacyWithoutBackgroundColor';
    forecast: {
      ageWarning?: number;
      updateInterval: number;
      timePeriod: number | string | 'data';
      forecastLengthTitle?: number;
      data: {
        producer?: string;
        parameters: (keyof ForecastParameters)[];
      }[];
      defaultParameters: DisplayParameters[];
      excludeDayLength?: boolean;
      excludeDayDuration?: boolean;
      excludePolarNightAndMidnightSun?: boolean;
      infoBottomSheet?: {
        showAllSymbols?: boolean;
      };
    };
    observation: ObservationEnabled | ObservationDisabled;
    meteorologist?: MeteorologistSnapshotConfig;
    useCardinalsForWindDirection?: boolean;
  };
  warnings: WarningsEnabled | WarningsDisabled;
  news: NewsEnabled | NewsDisabled;
  settings: {
    languages: string[];
    units: {
      temperature: 'C' | 'F';
      precipitation: 'mm' | 'in';
      wind: 'm/s' | 'km/h' | 'mph' | 'bft' | 'kn';
      pressure: 'hPa' | 'inHg' | 'mmHg' | 'mbar';
    };
    showUnitSettings?: boolean;
    clockType: 12 | 24;
    themes: Themes;
  };
  announcements: AnnouncementsEnabled | AnnouncementsDisabled;
  socialMediaLinks: SocialMediaLink[];
  unresolvedGeoIdErrorMessage?: UnresolvedGeoIdErrorMessage;
  onboardingWizard: OnboardingWizard;
  feedback?: Feedback;
}

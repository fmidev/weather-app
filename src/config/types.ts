import { Location } from '@store/location/types';
import { DisplayParameters, ForecastParameters } from '@store/forecast/types';
import {
  ObservationParameters,
  DailyObservationParameters,
} from '@store/observation/types';

/** Requires at least one of the selected properties while keeping the others optional. */
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/** Time range and animation settings for a map layer. */
type BaseTimes = {
  /**
   * Time step in minutes. The time slider supports 5, 15, 30, 60 and 180;
   * other values fall back to 15 in the slider.
   */
  timeStep: number;
  /** Number of observation time steps, including the latest observation. */
  observation?: number;
  /** Number of forecast time steps after the observation/current-time boundary. */
  forecast?: number;
  /** Legacy animation setting; playback now uses the speed stored in Redux. */
  animationSpeed?: number;
};

/** A WMS layer supplying either the observation or forecast part of an overlay. */
export type WMSSource = {
  /** Key in map.sources of {@link ConfigType}, identifying the service base URL. */
  source: string;
  /** WMS layer name, as advertised in the service's GetCapabilities response. */
  layer: string;
  /** Part of the animation supplied by this source. */
  type: 'observation' | 'forecast';
  /** Use the advertised reference_time dimension when available. Defaults to true. */
  referenceTimeEnabled?: boolean;
  /**
   * Additional GetMap parameters supported by the service, such as styles.
   * A styles value can provide separate dark and light theme variants.
   */
  customParameters?: {
    [name: string]: string | number | { dark: string; light: string };
  };
};

/** A SmartMet TimeSeries source for values displayed on the map. */
export type TimeseriesSource = {
  /** Key in map.sources of {@link ConfigType}, identifying the service base URL. */
  source: string;
  /** Whether this source represents observations or forecasts. */
  type: 'observation' | 'forecast';
  /** Parameter names requested from the TimeSeries API. */
  parameters: string[];
  /** SmartMet producer name. Defaults to 'default'. */
  producer?: string;
  /** Location keyword(s); arrays are sent as a comma-separated keyword value. */
  keyword: string | string[];
};

/** Requires an observation range, a forecast range, or both. */
type Times = RequireAtLeastOne<BaseTimes, 'forecast' | 'observation'>;

/** A numeric setting selected using React Native's Platform.OS. */
type PlatformSpecificNumber = {
  /** Value used on iOS. */
  ios: number;
  /** Value used on Android. */
  android: number;
  /** Optional Windows value, included to allow indexing with Platform.OS. */
  windows?: number;
  /** Optional macOS value, included to allow indexing with Platform.OS. */
  macos?: number;
  /** Optional web value, included to allow indexing with Platform.OS. */
  web?: number;
};

/** Temperature unit: Celsius or Fahrenheit. */
type TemperatureUnit = 'C' | 'F';
/** Precipitation unit: millimetres or inches. */
type PrecipitationUnit = 'mm' | 'in';
/** Wind unit: metres/second, kilometres/hour, miles/hour, Beaufort or knots. */
type WindUnit = 'm/s' | 'km/h' | 'mph' | 'bft' | 'kn';
/** Pressure unit: hectopascals, inches of mercury, millimetres of mercury or millibars. */
type PressureUnit = 'hPa' | 'inHg' | 'mmHg' | 'mbar';
/** Unit abbreviations accepted by the application. */
export type MeasurementUnit =
  TemperatureUnit | PrecipitationUnit | WindUnit | PressureUnit;

/** Groups related layers, such as different time resolutions of the same product. */
interface LayerGroup {
  /** Unique group identifier. */
  id: number;
  /** Group labels keyed by language code. */
  name: { [lang: string]: string };
  /**
   * IDs of map.layers entries in {@link ConfigType} belonging to this group.
   * Selecting the group activates the first entry; other entries offer time-step options.
   */
  layers: number[];
}

/** A selectable weather overlay and its data sources, legends and time range. */
export interface MapLayer {
  /** Unique layer identifier, also used by layer groups and persisted selection. */
  id: number;
  /** Data format. The current overlay loader handles WMS and Timeseries layers. */
  type: 'WMS' | 'GeoJSON' | 'Timeseries';
  /** Layer labels keyed by language code. */
  name?: { [lang: string]: string };
  /** Optional localized labels for the time-step selector; otherwise minutes are shown. */
  timeButton?: {
    [lang: string]: {
      /** Visible time-step button text. */
      label: string;
      /** Screen reader label describing the time-step option. */
      accessibilityLabel: string;
    };
  };
  /** Built-in legend sections used when map.infoBottomSheet.url is not configured. */
  legend?: {
    /** Include the Finnish precipitation product description and legend. */
    hasPrecipitationFin?: boolean;
    /** Include the Scandinavian precipitation product description and legend. */
    hasPrecipitationScan?: boolean;
    /** Include the 15-minute lightning legend. */
    hasLightning15?: boolean;
    /** Include the 60-minute lightning legend. */
    hasLightning60?: boolean;
    /** Include the short wind-arrow product description. */
    hasWindArrowsShort?: boolean;
    /** Include the long wind-arrow product description. */
    hasWindArrowsLong?: boolean;
    /** Include the short temperature product description. */
    hasTemperatureShort?: boolean;
    /** Include the long temperature product description. */
    hasTemperatureLong?: boolean;
  };
  /** Use WMS sources for WMS layers and TimeSeries sources for Timeseries layers. */
  sources: WMSSource[] | TimeseriesSource[];
  /** Time resolution and observation/forecast ranges for the animation. */
  times: Times;
  /** Tile size in pixels, shared across platforms or selected per platform. */
  tileSize?: number | PlatformSpecificNumber;
  /** WMS image format suffix, such as 'png' or 'webp'. Defaults to 'png'. */
  tileFormat?: string;
}

/** Theme-specific MapLibre style URLs, built by concatenating url and the style path. */
export interface MapStyle {
  /** Base URL, including any separator needed before the style path. */
  url: string;
  /** Light style path; {lang} placeholders are replaced with the current language. */
  lightStyle: string;
  /** Dark style path; {lang} placeholders are replaced with the current language. */
  darkStyle: string;
}

/** Geomagnetic observations used to estimate the likelihood of aurora borealis. */
interface GeoMagneticObservations {
  /** Fetch geomagnetic observations when true. */
  enabled: boolean;
  /** SmartMet producer providing geomagneticRIndex observations. */
  producer: string;
  /** Country codes for which the aurora likelihood is requested. */
  countryCodes: string[];
  /** Validate API responses against the bundled JSON schema. Defaults to true. */
  schemaValidation?: boolean;
}

/** Observation data and station selection settings, required when enabled. */
interface Observation {
  /** Minimum data refresh interval in minutes. */
  updateInterval: number;
  /** Maximum number of nearby stations requested for the station selector. */
  numberOfStations: number;
  /** Producer name, or names keyed by country code with a required default fallback. */
  producer: string | { default: string; [name: string]: string };
  /** Station identifier parameter used in API queries and response grouping. */
  identifier: 'fmisid' | 'wmo';
  /** Producers supporting daily observations; an extra query is made when one is selected. */
  dailyProducers?: string[];
  /** Hourly observation history in hours. Daily observations use a separate 30-day range. */
  timePeriod: number;
  /** Hourly observation parameters requested from the API. */
  parameters: (keyof ObservationParameters)[];
  /** Daily observation parameters, fetched when the selected producer is in dailyProducers. */
  dailyParameters?: (keyof DailyObservationParameters)[];
  /** Optional geomagnetic data for aurora likelihood estimates. */
  geoMagneticObservations?: GeoMagneticObservations;
  /**
   * In the vertical layout, defer refreshes until the observation panel is visible.
   * Defaults to true in that layout; other layouts refresh without this restriction.
   */
  lazyLoad?: boolean;
  /** Validate API responses against the bundled JSON schemas. Defaults to true. */
  schemaValidation?: boolean;
}

/** Enabled observations require all mandatory observation settings. */
interface ObservationEnabled extends Observation {
  /** Enable the observation panel and data fetching. */
  enabled: true;
}

/** Disabled observations allow the remaining settings to be omitted. */
interface ObservationDisabled extends Partial<Observation> {
  /** Disable observations. */
  enabled: false;
}
/** An Atom feed linking to Common Alerting Protocol (CAP) messages. */
interface CapDataSource {
  /** Identifier of the configured feed. */
  id: number;
  /** Feed URL. The current CAP loader fetches the first configured data source. */
  url: string;
  /** Legacy icon URL setting; the current CAP view uses bundled warning symbols. */
  urlIcons: string;
}
/** Settings for the native CAP warning map and lists, used when warnings.useCapView is true. */
interface CapViewSettings {
  /** Map height in React Native layout units. Defaults to 400. */
  mapHeight?: number;
  /** Number of days shown, including today. */
  numberOfDays: number;
  /** CAP feed definitions; currently only the first entry is fetched. */
  datasources: CapDataSource[];
  /** Initial map centre and visible latitude/longitude spans, in degrees. */
  initialRegion: {
    /** Centre latitude in degrees. */
    latitude: number;
    /** Centre longitude in degrees. */
    longitude: number;
    /** Visible latitude span in degrees. */
    latitudeDelta: number;
    /** Visible longitude span in degrees. */
    longitudeDelta: number;
  };
  /** Show local warnings when the selected location is in location.default.country. */
  localWarningsEnabled?: boolean;
  /** Place local warnings after the country overview instead of before it. */
  localWarningsAfterCountry?: boolean;
  /** Allow zoom gestures on the warning map; omitted values use the map component default. */
  mapZoomEnabled?: boolean;
  /** Allow panning on the warning map; omitted values use the map component default. */
  mapScrollEnabled?: boolean;
  /** Show the Android map toolbar; omitted values use the map component default. */
  mapToolbarEnabled?: boolean;
  /** Show a warning count for grouped warnings when greater than one. Defaults to true. */
  warningBlockWarningCountEnabled?: boolean;
  /** Append the selected location's name to the warning list title. */
  includeAreaInTitle?: boolean;
  /** Legacy symbol background setting; not read by the current CAP view. */
  severityBackgroundInSymbol?: boolean;
  /** Replace lists of more than five areas with an area count. */
  hideLongArealist?: boolean;
  /** Use relative day labels, such as today, instead of weekday labels. */
  useRelativeDays?: boolean;
  /** Sort comma-separated area names using the current language's collation. */
  sortAreas?: boolean;
  /** Remove duplicate names from comma-separated area lists. */
  removeDuplicateAreas?: boolean;
  /** Polygon simplification tolerance in metres. Omit to retain the original polygons. */
  polygonAccuracy?: number;
}

/** Warning data and presentation settings, required when warnings are enabled. */
interface Warnings {
  /** Warning API endpoints keyed by country code, for example FI; queries include lang. */
  apiUrl: {
    [country: string]: string;
  };
  /** Use the CAP warning view instead of the Smartmet Alert client webview. Defaults to false. */
  useCapView?: boolean;
  /** Minimum warning data refresh interval in minutes. */
  updateInterval: number;
  /** Legacy age warning setting; not read by the current warning views. */
  ageWarning?: number;
  /** SmartAlert client URL used when useCapView is false or omitted. */
  webViewUrl?: string;
  /** Feed, map and list settings needed by the native CAP view. */
  capViewSettings?: CapViewSettings;
  /** Validate responses from apiUrl against the bundled JSON schema. Defaults to true. */
  schemaValidation?: boolean;
}

/** Enabled warnings require the mandatory warning settings. */
interface WarningsEnabled extends Warnings {
  /** Enable warnings and the warnings tab. */
  enabled: true;
}

/** Disabled warnings allow the remaining settings to be omitted. */
interface WarningsDisabled extends Partial<Warnings> {
  /** Disable warnings. */
  enabled: false;
}

/** Application announcement endpoints and refresh settings. */
interface Announcements {
  /** Minimum announcement refresh interval in minutes. */
  updateInterval: number;
  /** Validate API responses against the bundled JSON schema. Defaults to true. */
  schemaValidation?: boolean;
  /** Announcement API endpoints keyed by language code. */
  api: {
    [locale: string]: string;
  };
}
/** Enabled announcements require the mandatory announcement settings. */
interface AnnouncementsEnabled extends Announcements {
  /** Enable application announcements. */
  enabled: true;
}

/** Disabled announcements allow the remaining settings to be omitted. */
interface AnnouncementsDisabled extends Partial<Announcements> {
  /** Disable application announcements. */
  enabled: false;
}

/** Remote configuration settings; this section cannot be overridden remotely. */
interface DynamicConfig {
  /** URL from which remote configuration overrides are fetched. */
  readonly apiUrl: string;
  /** Minimum time between update attempts, in minutes; checked when the app becomes active. */
  interval: number;
}

/** Enabled remote configuration requires an endpoint and update interval. */
interface DynamicConfigEnabled extends DynamicConfig {
  /** Fetch and merge remote overrides into the bundled configuration. */
  enabled: true;
}

/** Disabled remote configuration allows the endpoint and interval to be omitted. */
interface DynamicConfigDisabled extends Partial<DynamicConfig> {
  /** Use the bundled configuration without fetching remote overrides. */
  enabled: false;
}

/** A social media account shown in the application's information view. */
interface SocialMediaLink {
  /** Display name of the social media service. */
  name: string;
  /** Name of an icon provided by the application's assets. */
  icon: string;
  /** Optional deep link opened when the corresponding application is available. */
  appUrl?: string;
  /** Web URL opened when the application deep link is unavailable. */
  url: string;
}

/** Service-area error messages keyed by language code. */
interface UnresolvedGeoIdErrorMessage {
  [language: string]: {
    /** Error heading shown when the location cannot be resolved. */
    title: string;
    /** Optional explanation of the service-area limitation. */
    additionalInfo?: string;
  };
}

/** Theme availability with the light theme required. */
interface LightThemeEnabled {
  /** Keep the light theme available. */
  light: true;
  /** Whether the dark theme is also available. */
  dark: boolean;
}
/** Theme availability with the dark theme required. */
interface DarkThemeEnabled {
  /** Whether the light theme is also available. */
  light: boolean;
  /** Keep the dark theme available. */
  dark: true;
}

/** Available application themes; at least one must be enabled. */
type Themes = LightThemeEnabled | DarkThemeEnabled;

/** Custom positioning of the bundled onboarding background image. */
interface BackgroundImageProperties {
  /** Offset from the top in React Native layout units. */
  top: number;
  /** Image height in React Native layout units. */
  height: number;
}

/** Bundled onboarding settings; this section cannot be overridden remotely. */
interface OnboardingWizard {
  /** Show the onboarding flow for users who have not completed setup. */
  enabled: boolean;
  /** Select a provider logo for the current language when available. */
  languageSpecificLogo?: boolean;
  /** Require existing users to accept the terms of use again for the current app version. */
  termsOfUseChanged?: boolean;
  /** Override background image placement on the onboarding and setup screens. */
  backgroundImageProperties?: BackgroundImageProperties;
}

/** Feedback email, FAQ links and accessibility feedback contacts. */
interface Feedback {
  /** Show the feedback entry in the application's information view. */
  enabled: boolean;
  /** Recipient address for general feedback. */
  email: string;
  /** General feedback email subjects keyed by language code. */
  subject: {
    [locale: string]: string;
  };
  /** FAQ web URLs keyed by language code. */
  faqUrl?: {
    [locale: string]: string;
  };
  /** Accessibility feedback contacts keyed by language code. */
  accessibility?: {
    [locale: string]: {
      /** Recipient address for accessibility feedback. */
      email: string;
      /** Accessibility feedback email subject. */
      subject: string;
    };
  };
}

/** News endpoints, item limits and expiry settings. */
interface News {
  /** News API endpoints keyed by language code. */
  apiUrl: {
    [language: string]: string;
  };
  /** Maximum item count requested through the API's limit parameter. */
  numberOfNews: number;
  /** Minimum news refresh interval in minutes. */
  updateInterval: number;
  /** Hide news older than this many days based on createdAt; 0 disables expiry. */
  outdated: number;
  /** Validate API responses against the bundled JSON schema. Defaults to true. */
  schemaValidation?: boolean;
}

/** Enabled news requires the mandatory news settings. */
interface NewsEnabled extends News {
  /** Enable fetching and displaying news. */
  enabled: true;
}

/** Disabled news allows the remaining settings to be omitted. */
interface NewsDisabled extends Partial<News> {
  /** Disable news. */
  enabled: false;
}

/** Optional text forecast supplied by a meteorologist. */
interface MeteorologistSnapshotConfig {
  /** API endpoint providing the meteorologist's snapshot. */
  url: string;
  /** Minimum snapshot refresh interval in minutes. */
  updateInterval: number;
  /** Validate API responses against the bundled JSON schema. Defaults to true. */
  schemaValidation?: boolean;
}

/** Matomo tracking settings. Provide siteId and url when enabling analytics. */
interface Analytics {
  /** Enable Matomo event tracking. */
  enabled: boolean;
  /** Matomo site IDs keyed by language code, for example { fi: 22 }. */
  siteId?: Record<string, number>;
  /** Matomo server URL. */
  url?: string;
}

/** Remote Markdown documentation for map layers. */
interface MapInfoBottomSheet {
  /**
   * Markdown URL template with {lang} and {layer} placeholders.
   * All colons in a WMS layer name become hyphens.
   * Timeseries layers use 'timeseries'.
   */
  url: string;
}

/** Select bundled Markdown content for application information screens. */
interface MarkdownSettings {
  /** Render the terms of use from the bundled Markdown documents. */
  termsOfUse: boolean;
  /** Render the application information from the bundled Markdown documents. */
  aboutTheApplication: boolean;
  /** Retained for compatibility; the accessibility screen always uses Markdown. */
  accessibility?: boolean;
}

/**
 * Moment.js format strings used by formatDateTime in src/utils/moment.ts.
 * A leading U is an application extension that capitalizes the formatted result.
 * When the 12-hour clock is selected, HH:mm/H:mm (also with dots) becomes h:mm a.
 */
interface DateTimeFormats {
  /** Short date, for example 'D.M.'. */
  date: string;
  /** Date with a weekday, for example 'Udddd, D.M.'. */
  longDate: string;
  /** Date including the year, for example 'D.M.YYYY'. */
  dateYear: string;
  /** Short date and time, for example 'D.M. HH:mm'. */
  dateTime: string;
  /** Full date and time, for example 'D.M.YYYY HH:mm'. */
  longDateTime: string;
  /** Time of day, for example 'HH:mm'. */
  time: string;
  /** Abbreviated weekday, for example 'Udd'. */
  weekdayAbbreviation: string;
  /** Full weekday, for example 'Udddd'. */
  weekday: string;
  /** Weekday and date, for example 'dddd D.M.'. */
  weekdayAndDate: string;
  /** Abbreviated weekday and date, for example 'Udd D.M.'. */
  weekdayAbbreviationAndDate: string;
}

/** Date/time formats read from defaultConfig.ts, without remote overrides. */
interface DateTimeSettings {
  /** Fallback formats for locales or individual format keys without an override. */
  default: DateTimeFormats;
  /**
   * Partial format overrides keyed by lowercase locale, such as 'en' or 'en-gb'.
   * The full locale's format object is used when present, otherwise the base language's.
   * Missing keys in the selected object fall back to default.
   */
  locales?: Record<string, Partial<DateTimeFormats>>;
}

// TODO: how to handle errors. Add error categories to "actions" and then name -field can be error message content
// for example: trackMatomoEvent('Error', 'Error loading forecast data', error.getMessage())
// Events in Matomo have three dimension (category, action, name)
// and we'll probably misuse them, but the reason is because
// this way it's easier to see stuff in Matomo web UI.
//
// Category = who, Action = where, Name = what was done.
/** Matomo event categories describing the kind of event. */
export type AnalyticCategories =
  'User action' | 'Init' | 'Notice' | 'Warning' | 'Error';
/** Matomo event actions identifying the screen, feature or subsystem. */
export type AnalyticActions =
  | 'Weather'
  | 'Map'
  | 'Warnings'
  | 'Other'
  | 'Search'
  | 'Settings'
  | 'Navigation'
  | 'Geolocation'
  | 'News'
  | 'Platform'
  | 'Announcements'
  | 'Autocomplete'
  | 'Timeseries'
  | 'WMS'
  | 'DynamicConfig'
  | 'Snapshot'
  | 'Onboarding'
  | 'Not specified';

/**
 * Application configuration bundled in defaultConfig.ts.
 *
 * Remote configuration is merged into the bundled values, except for dynamicConfig
 * and onboardingWizard. Nested objects are merged rather than replaced, and arrays
 * use the merge rules in src/config/DynamicConfig.ts. Date/time formatting reads the
 * bundled settings.dateTime directly and therefore ignores remote overrides.
 *
 * Optional properties do not imply a shared default: see each setting's documented
 * fallback. Values chosen in a fork's defaultConfig.ts are not universal defaults.
 *
 * @see https://github.com/fmidev/weather-app/wiki/Default-configuration-file-(defaultConfig.ts)
 */
export interface ConfigType {
  /** Remote override endpoint and refresh settings; cannot be overridden remotely. */
  dynamicConfig: DynamicConfigEnabled | DynamicConfigDisabled;
  /** Location search, reverse geolocation and saved-location limits. */
  location: {
    /** Use SmartMet services or the bundled local JSON location catalogue. */
    source: 'smartmet' | 'json';
    /** Initial location, including coordinates, ID, country code and IANA time zone. */
    default: Location;
    /** Autocomplete API endpoint used with the SmartMet location source. */
    apiUrl: string;
    /** Optional fmi-apikey header value for autocomplete requests. */
    fmiApiKey?: string;
    /** SmartMet location keyword used for search and optional reverse-geolocation filtering. */
    keyword: string;
    /** Maximum number of recent locations retained in search history. */
    maxRecent: number;
    /** Maximum number of locations the user can save as favourites. */
    maxFavorite: number;
    /**
     * Maximum distance in kilometres for resolving coordinates to a named location.
     * The JSON source defaults to 10; SmartMet receives maxdistance only when set.
     */
    maxDistance?: number;
    /** Restrict SmartMet reverse geolocation to keyword locations. Defaults to false. */
    useInKeyword?: boolean;
    /** Validate search and reverse-geolocation API responses. Defaults to true. */
    schemaValidation?: boolean;
  };
  /** Map data services, selectable overlays and MapLibre background styles. */
  map: {
    /** Minimum map data refresh interval in minutes. */
    updateInterval: number;
    /** Service base URLs keyed by the names used in each layer source. */
    sources: { [name: string]: string };
    /**
     * Optional fmi-apikey header values. WMS uses the source name as the key;
     * the current TimeSeries map loader uses the smartmet entry.
     */
    fmiApiKey?: { [name: string]: string };
    /** Groups of layer IDs shown in the layer selector. */
    layerGroups: LayerGroup[];
    /** Weather overlays available for selection and animation. */
    layers: MapLayer[];
    /** MapLibre base style, drawn below weather layers. */
    baseMap?: MapStyle;
    /** MapLibre overlay style for content drawn above weather layers. */
    overlayMap?: MapStyle;
    /** Remote layer documentation; omit to use the built-in legends. */
    infoBottomSheet?: MapInfoBottomSheet;
  };
  /** Weather screen presentation, forecast, observation and text forecast services. */
  weather: {
    /** SmartMet TimeSeries endpoint for weather data and reverse geolocation. */
    apiUrl: string;
    /** Optional fmi-apikey header value for requests to the weather endpoint. */
    fmiApiKey?: string;
    /**
     * Weather screen layout. 'vertical' uses the vertical forecast view;
     * 'legacyWithoutBackgroundColor' disables the weather background gradient.
     * Omit or use 'default' for the standard layout.
     */
    layout?: 'default' | 'vertical' | 'legacyWithoutBackgroundColor';
    /** Allow weather background images and enable them initially. Defaults to true. */
    backgroundImagesEnabled?: boolean;
    /** Show the favourites panel and fetch forecasts for favourites. Defaults to true. */
    favoritesPanelEnabled?: boolean;
    /** Forecast data sources, freshness limits and display options. */
    forecast: {
      /**
       * Minutes since the last successful fetch before showing the stale-data warning.
       * This differs from maxAge, which checks the data's modtime. Defaults to 720.
       */
      ageWarning?: number;
      /** Maximum forecast age in hours based on modtime; older data is hidden. Defaults to 24. */
      maxAge?: number;
      /** Minimum forecast refresh interval in minutes. */
      updateInterval: number;
      /**
       * Value passed unchanged as the SmartMet endtime parameter.
       * Use 'data' for the available data range, or a relative end time such as '+5d'
       * or '+120h'. Numeric values follow the server's endtime syntax.
       *
       * @example 'data'
       * @example '+120h'
       * @see https://github.com/fmidev/smartmet-plugin-timeseries/blob/master/docs/Using-the-Timeseries-API.md#time-period
       */
      timePeriod: number | string | 'data';
      /** Day count displayed in the forecast panel title; does not limit data. Defaults to 10. */
      forecastLengthTitle?: number;
      /** Parameter groups fetched from their respective SmartMet producers. */
      data: {
        /** SmartMet producer name. Defaults to 'default'. */
        producer?: string;
        /** Forecast parameters requested from this producer. */
        parameters: (keyof ForecastParameters)[];
      }[];
      /** Parameters initially displayed before the user customizes the selection. */
      defaultParameters: DisplayParameters[];
      /** Hide day length from forecast parameter selection, rows and related information. */
      excludeDayLength?: boolean;
      /** Hide day duration details from sun/day information sections. */
      excludeDayDuration?: boolean;
      /** Hide polar night and midnight sun details from sun/day information sections. */
      excludePolarNightAndMidnightSun?: boolean;
      /** Options for the weather information sheet. */
      infoBottomSheet?: {
        /** Show the full symbol list immediately, without the show-more control. Defaults to false. */
        showAllSymbols?: boolean;
      };
      /** Validate supported forecast responses against bundled JSON schemas. Defaults to true. */
      schemaValidation?: boolean;
    };
    /** Observation settings; required fields may be omitted when enabled is false. */
    observation: ObservationEnabled | ObservationDisabled;
    /** Optional meteorologist text forecast endpoint and refresh settings. */
    meteorologist?: MeteorologistSnapshotConfig;
    /** Round wind direction to compass points instead of displaying individual degrees. */
    useCardinalsForWindDirection?: boolean;
  };
  /** Warning services and views; required fields may be omitted when enabled is false. */
  warnings: WarningsEnabled | WarningsDisabled;
  /** News service; required fields may be omitted when enabled is false. */
  news: NewsEnabled | NewsDisabled;
  /** Available languages, initial user preferences and application information options. */
  settings: {
    /** Supported language codes offered in language selection. */
    languages: string[];
    /** Initial measurement units, used until the user selects other units. */
    units: {
      /** Initial temperature unit. */
      temperature: TemperatureUnit;
      /** Initial precipitation unit. */
      precipitation: PrecipitationUnit;
      /** Initial wind speed unit. */
      wind: WindUnit;
      /** Initial pressure unit. */
      pressure: PressureUnit;
    };
    /** Show measurement unit controls in settings. Hidden when omitted. */
    showUnitSettings?: boolean;
    /** Unit choices hidden from the unit settings controls. */
    excludeUnits?: MeasurementUnit[];
    /** Initial 12-hour or 24-hour clock preference. */
    clockType: 12 | 24;
    /** Bundled date/time format strings; remote overrides do not affect formatting. */
    dateTime: DateTimeSettings;
    /** Available light/dark themes; at least one must be enabled. */
    themes: Themes;
    /** Include technical error details in error views. Defaults to false. */
    verboseErrorMessages?: boolean;
    /** Select bundled Markdown content for the terms and application information screens. */
    markdown?: MarkdownSettings;
  };
  /** Application announcements; required fields may be omitted when enabled is false. */
  announcements: AnnouncementsEnabled | AnnouncementsDisabled;
  /** Social media account links shown in the application's information view. */
  socialMediaLinks: SocialMediaLink[];
  /** Localized error text for locations outside the forecast service area. */
  unresolvedGeoIdErrorMessage?: UnresolvedGeoIdErrorMessage;
  /** Onboarding and terms acceptance settings; cannot be overridden remotely. */
  onboardingWizard: OnboardingWizard;
  /** General and accessibility feedback contacts and localized FAQ links. */
  feedback?: Feedback;
  /** Optional Matomo tracking configuration. Tracking is disabled when omitted. */
  analytics?: Analytics;
}

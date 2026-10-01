export type {
  ChartData,
  ChartDomain,
  ChartMinMax,
  ChartType,
  ChartValue,
  ChartValues,
  Parameter,
} from '../charts/types';

export type ChartPoint = {
  x: number;
  temperature?: number | null;
  feelsLike?: number | null;
  dewPoint?: number | null;
  precipitation1h?: number | null;
  pop?: number | null;
  windSpeedMS?: number | null;
  windGust?: number | null;
  hourlymaximumgust?: number | null;
  windDirection?: number | null;
  humidity?: number | null;
  relativeHumidity?: number | null;
  pressure?: number | null;
  visibility?: number | null;
  totalCloudCover?: number | null;
  cloudHeight?: number | null;
  snowDepth?: number | null;
  snowDepth06?: number | null;
  uvCumulated?: number | null;
  rrday?: number | null;
  maximumTemperature?: number | null;
  minimumTemperature?: number | null;
  minimumGroundTemperature06?: number | null;
};

export type ChartKey = Exclude<keyof ChartPoint, 'x'>;

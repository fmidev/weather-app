import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import HumidityChart from './HumidityChart';
import PressureChart from './PressureChart';
import VisCloudChart from './VisCloudChart';
import CloudHeightChart from './CloudHeightChart';
import { ChartSettings, ChartType, Parameter } from './types';
import SnowDepthChart from './SnowDepth';
import UvChart from './UvChart';
import WeatherChart from './WeatherChart';

type TypeParameters = {
  [key in ChartType]: Parameter[];
};

export const observationTypeParameters: TypeParameters = {
  pressure: ['pressure'],
  precipitation: ['precipitation1h'],
  temperature: ['temperature', 'dewPoint'],
  humidity: ['humidity'],
  wind: ['windSpeedMS', 'windGust', 'windDirection'],
  snowDepth: ['snowDepth'],
  visCloud: ['visibility', 'totalCloudCover'],
  cloud: ['cloudHeight'],
  uv: [],
  weather: ['temperature', 'dewPoint', 'precipitation1h'],
};

export const forecastTypeParameters: TypeParameters = {
  pressure: ['pressure'],
  precipitation: ['precipitation1h', 'pop'],
  temperature: ['temperature', 'feelsLike', 'dewPoint'],
  humidity: ['relativeHumidity'],
  wind: ['windSpeedMS', 'hourlymaximumgust', 'windDirection'],
  snowDepth: [],
  visCloud: [],
  cloud: [],
  uv: ['uvCumulated'],
};

const chartSettings = (
  chartType: ChartType,
  observation: boolean | undefined
): ChartSettings => {
  const params = observation
    ? observationTypeParameters[chartType]
    : forecastTypeParameters[chartType];

  switch (chartType) {
    case 'precipitation':
      return {
        params,
        Component: PrecipitationChart,
      };
    case 'pressure':
      return {
        params,
        Component: PressureChart,
      };
    case 'humidity':
      return {
        params,
        Component: HumidityChart,
      };
    case 'visCloud':
      return {
        params,
        Component: VisCloudChart,
      };
    case 'cloud':
      return {
        params,
        Component: CloudHeightChart,
      };
    case 'temperature':
      return {
        params,
        Component: TemperatureChart,
      };
    case 'wind':
      return {
        params,
        Component: WindChart,
      };
    case 'snowDepth':
      return {
        params,
        Component: SnowDepthChart,
      };
    case 'uv':
      return {
        params,
        Component: UvChart,
      };
    case 'weather':
      return {
        params,
        Component: WeatherChart,
      };
    default: {
      return { params: [], Component: TemperatureChart };
    }
  }
};

export default chartSettings;

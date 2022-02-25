import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import HumidityChart from './HumidityChart';
import PressureChart from './PressureChart';
import VisCloudChart from './VisCloudChart';
import CloudHeightChart from './CloudHeightChart';
import { ChartSettings, ChartType, Parameter } from './types';
import SnowDepthChart from './SnowDepth';

type TypeParameters = {
  [key in ChartType]: Parameter[];
};

const typeParameters: TypeParameters = {
  precipitation: ['precipitation1h'],
  pressure: ['pressure'],
  visCloud: ['visibility', 'totalCloudCover'],
  cloud: ['cloudHeight'],
  humidity: ['humidity'],
  snowDepth: ['snowDepth'],
  temperature: [],
  wind: [],
};

export const observationTypeParameters: TypeParameters = {
  ...typeParameters,
  temperature: ['temperature', 'dewPoint'],
  wind: ['windSpeedMS', 'windGust', 'windDirection'],
};

export const forecastTypeParameters: TypeParameters = {
  ...typeParameters,
  temperature: ['temperature', 'feelsLike'],
  wind: ['windSpeedMS', 'hourlymaximumgust', 'windDirection'],
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
    default: {
      return { params: [], Component: TemperatureChart };
    }
  }
};

export default chartSettings;

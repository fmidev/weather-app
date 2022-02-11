import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import HumidityChart from './HumidityChart';
import PressureChart from './PressureChart';
import VisCloudChart from './VisCloudChart';
import CloudHeightChart from './CloudHeightChart';
import { ChartSettings, ChartType } from './types';
import SnowDepthChart from './SnowDepth';

const chartSettings = (
  chartType: ChartType,
  observation: boolean | undefined
): ChartSettings => {
  switch (chartType) {
    case 'precipitation':
      return {
        params: ['precipitation1h'],
        Component: PrecipitationChart,
      };
    case 'pressure':
      return {
        params: ['pressure'],
        Component: PressureChart,
      };
    case 'humidity':
      return {
        params: ['humidity'],
        Component: HumidityChart,
      };
    case 'visCloud':
      return {
        params: ['visibility', 'totalcloudcover'],
        Component: VisCloudChart,
      };
    case 'cloud':
      return {
        params: ['cloudheight'],
        Component: CloudHeightChart,
      };
    case 'temperature':
      return {
        params: ['temperature', observation ? 'dewpoint' : 'feelsLike'],
        Component: TemperatureChart,
      };
    case 'wind':
      return {
        params: [
          'windspeedms',
          observation ? 'windgust' : 'hourlymaximumgust',
          'winddirection',
        ],
        Component: WindChart,
      };
    case 'snowDepth':
      return {
        params: ['snowDepth'],
        Component: SnowDepthChart,
      };
    default: {
      return { params: [], Component: TemperatureChart };
    }
  }
};

export default chartSettings;

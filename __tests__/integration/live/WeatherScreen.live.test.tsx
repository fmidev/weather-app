import '@testing-library/react-native/dont-cleanup-after-each';
import './weatherScreenNativeMocks';

import { cleanup, waitFor } from '@testing-library/react-native';
import Ajv from 'ajv/dist/2020';
import { Config } from '@config';
import i18n from '@i18n';
import { mountScreen } from './weatherScreenHarness';
import defaultConfig from '../../../defaultConfig';
import { liveResponses } from '../../../jest.live.setup';
import geomagneticSchema from '../../../src/schemas/timeseries-geomagnetic-observations.schema.json';

const REQUEST_TIMEOUT_MS = 30000;
let screen: ReturnType<typeof mountScreen>;

// Report service/validation failures without dumping Axios configs or API keys.
const expectApiSuccess = (name: string, error: unknown) => {
  if (error) {
    const message = typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
    throw new Error(`${name}: ${message}`);
  }
  expect(error).toBe(false);
};

describe('WeatherScreen with live defaultConfig APIs', () => {
  beforeAll(async () => {
    Config.setDefaultConfig(defaultConfig);
    await i18n.changeLanguage('fi');
    // One initial load is shared by all assertions to avoid repeated requests.
    screen = mountScreen();
    await waitFor(() => {
      const state = screen.store.getState();
      expect(state.forecast.loading).toBe(false);
      expect(state.warnings.loading).toBe(false);
      expect(state.meteorologist.loading).toBe(false);
      expect(state.news.loading).toBe(false);
    }, { timeout: REQUEST_TIMEOUT_MS, interval: 100 });
    screen.scrollToObservations();
    await waitFor(() => {
      expect(screen.store.getState().observation.loading).toBe(false);
    }, { timeout: REQUEST_TIMEOUT_MS, interval: 100 });
  });

  afterAll(() => cleanup());

  it('validates live forecast and UV responses and renders the default location', () => {
    const { forecast } = screen.store.getState();
    expectApiSuccess('Forecast/UV', forecast.error);
    const steps = forecast.data?.[defaultConfig.location.default.id];
    expect(steps?.length).toBeGreaterThan(0);
    expect(steps?.some((step) => typeof step.temperature === 'number')).toBe(true);
    expect(steps?.some((step) => typeof step.uvCumulated === 'number')).toBe(true);
    expect(screen.view.getByText(defaultConfig.location.default.name)).toBeTruthy();
    expect(screen.view.getByTestId('next-hour-forecast-time')).toBeTruthy();
    expect(screen.view.getByTestId('forecast_table_button')).toBeTruthy();
  });

  it('validates live hourly and daily observations and renders an observation station', () => {
    const { observation } = screen.store.getState();
    expectApiSuccess('Observations', observation.error);
    expect(observation.id).toBe(defaultConfig.location.default.id);
    expect(observation.stations.length).toBeGreaterThan(0);
    const stationId = observation.stationId?.[observation.id] ?? 0;
    const station = observation.stations.find(({ id }) => id === stationId);
    expect(station).toBeDefined();
    expect(observation.data?.[stationId]?.length).toBeGreaterThan(0);
    expect(Object.values(observation.dailyData ?? {}).some((steps) => steps.length > 0)).toBe(true);
    expect(screen.view.getByTestId('observation_list_button')).toBeTruthy();
    expect(screen.view.getAllByText(new RegExp(station!.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).length)
      .toBeGreaterThan(0);
  });

  it('receives and validates the live geomagnetic observations used by the forecast', () => {
    const response = liveResponses.find(({ url, producer }) =>
      url === defaultConfig.weather.apiUrl &&
      producer === defaultConfig.weather.observation.geoMagneticObservations?.producer
    );
    expect(response?.status).toBe(200);
    const data: unknown = typeof response?.data === 'string' ? JSON.parse(response.data) : response?.data;
    const validate = new Ajv().compile(geomagneticSchema);
    validate(data);
    expect(validate.errors).toBeNull();
    expect(typeof screen.store.getState().forecast.auroraBorealisData?.[defaultConfig.location.default.id]).toBe('boolean');
  });

  it('validates the live warnings response and renders the warnings panel even without warnings', () => {
    const { warnings } = screen.store.getState();
    expectApiSuccess('Warnings', warnings.error);
    const data = warnings.data[defaultConfig.location.default.id];
    expect(data).toBeDefined();
    expect(Array.isArray(data?.warnings)).toBe(true);
    expect(Number.isFinite(Date.parse(data?.updated ?? ''))).toBe(true);
    expect(screen.view.getByTestId('warnings_panel')).toBeTruthy();
  });

  it('validates the live meteorologist snapshot and renders its content', () => {
    const { meteorologist } = screen.store.getState();
    expectApiSuccess('Meteorologist snapshot', meteorologist.error);
    expect(meteorologist.snapshot).not.toBeNull();
    const snapshot = meteorologist.snapshot!;
    expect(typeof snapshot.title).toBe('string');
    expect(Number.isFinite(Date.parse(snapshot.date))).toBe(true);
    expect(screen.view.getByText('Meteorologin sääkatsaus')).toBeTruthy();
    expect(screen.view.getByText(snapshot.text)).toBeTruthy();
  });

  it('validates live news, converts the response and renders the fetched titles', () => {
    const { news } = screen.store.getState();
    expectApiSuccess('News', news.error);
    expect(news.news.length).toBeGreaterThan(0);
    expect(news.news.length).toBeLessThanOrEqual(defaultConfig.news.numberOfNews!);
    news.news.forEach((item) => {
      expect(typeof item.id).toBe('string');
      expect(Number.isFinite(Date.parse(item.createdAt))).toBe(true);
      expect(screen.view.getByText(item.title)).toBeTruthy();
    });
  });
});

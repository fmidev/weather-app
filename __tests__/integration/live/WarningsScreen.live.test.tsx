import '@testing-library/react-native/dont-cleanup-after-each';
import './warningsScreenNativeMocks';

import { act, cleanup, fireEvent, waitFor } from '@testing-library/react-native';
import moment from 'moment-timezone';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { SET_CURRENT_LOCATION } from '@store/location/types';
import { selectDailyWarningData } from '@store/warnings/selectors';
import { mountWarningsScreen } from './warningsScreenHarness';
import { mockBottomSheetOpen, mockRoute, mockTrackMatomoEvent } from './weatherScreenNativeMocks';
import defaultConfig from '../../../defaultConfig';
import { liveResponses } from '../../../jest.live.setup';

const REQUEST_TIMEOUT_MS = 30000;
const location = defaultConfig.location.default;
const warningsUrl = defaultConfig.warnings.apiUrl?.[location.country];
let screen: ReturnType<typeof mountWarningsScreen>;

const expectWarningsSuccess = () => {
  const { error } = screen.store.getState().warnings;
  if (error) {
    const message = typeof error === 'object' ? error.message : String(error);
    throw new Error(`Warnings: ${message}`);
  }
  expect(error).toBe(false);
};

const getDailyWarnings = () => {
  const { warnings } = screen.store.getState();
  return selectDailyWarningData.resultFunc(warnings.data[location.id]!.warnings, warnings.fetchTimestamp);
};

const dayLabel = (day: ReturnType<typeof getDailyWarnings>[number]) =>
  `${moment(day.date).format('dddd DD MMMM')}, ${i18n.t('warnings:hasWarnings')}: ${day.count}, ${i18n.t(`warnings:severities:${day.severity}`)}`;

describe('WarningsScreen with live defaultConfig APIs', () => {
  beforeAll(async () => {
    Config.setDefaultConfig(defaultConfig);
    await i18n.changeLanguage('fi');
    moment.tz.setDefault(location.timezone);
    mockRoute.params.day = 0;
    // Share one live response across all UI assertions.
    screen = mountWarningsScreen();
    await waitFor(() => {
      expect(screen.store.getState().warnings.loading).toBe(false);
    }, { timeout: REQUEST_TIMEOUT_MS, interval: 100 });
  });

  afterAll(() => {
    cleanup();
    moment.tz.setDefault();
  });

  it('validates the live response and stores warnings for the configured location', () => {
    expectWarningsSuccess();
    const { warnings } = screen.store.getState();
    const data = warnings.data[location.id];
    expect(data).toBeDefined();
    expect(Array.isArray(data?.warnings)).toBe(true);
    expect(Number.isFinite(Date.parse(data?.updated ?? ''))).toBe(true);
    expect(warnings.updated).toBe(data?.updated);
    expect(warnings.fetchSuccessTime).toBeGreaterThan(0);
    const response = liveResponses.find(({ url }) => url === warningsUrl);
    expect(response?.status).toBe(200);
    expect(response?.params).toEqual(expect.objectContaining({
      latlon: `${location.lat},${location.lon}`, lang: 'fi',
    }));
    expect(screen.view.getByTestId('warnings_view')).toBeTruthy();
    expect(screen.view.getByTestId('warnings_panel')).toBeTruthy();
    expect(screen.view.getByText(`${i18n.t('warnings:panelTitle')}, ${location.name}`)).toBeTruthy();
  });

  it('renders five accessible day selectors with counts from the live warnings', () => {
    expectWarningsSuccess();
    const days = getDailyWarnings();
    expect(days).toHaveLength(5);
    days.forEach((day, index) => {
      const button = screen.view.getByA11yLabel(dayLabel(day));
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityState.selected).toBe(index === 0);
    });
  });

  it('selects each day and shows real warning details or the empty-day message', () => {
    expectWarningsSuccess();
    const { view } = screen;
    getDailyWarnings().forEach((day, index) => {
      fireEvent.press(view.getByA11yLabel(dayLabel(day)));
      expect(view.getByA11yLabel(dayLabel(day)).props.accessibilityState.selected).toBe(true);
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'User action', 'Warnings', `Select day ${index + 1} / (${day.count} warnings) / ${day.severity}`
      );
      if (day.warnings.length === 0) {
        expect(view.getByText(i18n.t('warnings:noWarningsText'))).toBeTruthy();
      } else {
        const details = view.getAllByA11yHint(i18n.t('warnings:moreAccessibilityHint'));
        expect(details).toHaveLength(day.count);
        day.warnings.forEach((warning, warningIndex) => {
          fireEvent.press(details[warningIndex]);
          expect(view.getAllByText(warning.description).length).toBeGreaterThan(0);
        });
        expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Warnings', 'Open warning details');
      }
    });
    fireEvent.press(view.getByA11yLabel(dayLabel(getDailyWarnings()[0])));
  });

  it('opens the info sheet and tracks the action', () => {
    expectWarningsSuccess();
    mockBottomSheetOpen.mockClear();
    fireEvent.press(screen.view.getByTestId('warnings_info_button'));
    expect(mockBottomSheetOpen).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Warnings', 'Open warnings info panel');
  });

  it('uses the day supplied by the navigation route without re-fetching warnings', () => {
    expectWarningsSuccess();
    const requestCount = liveResponses.filter(({ url }) => url === warningsUrl).length;
    mockRoute.params.day = 2;
    screen.reload();
    expect(screen.view.getByA11yLabel(dayLabel(getDailyWarnings()[2])).props.accessibilityState.selected).toBe(true);
    expect(screen.store.getState().warnings.loading).toBe(false);
    expect(liveResponses.filter(({ url }) => url === warningsUrl)).toHaveLength(requestCount);
    mockRoute.params.day = 0;
    screen.reload();
  });

  it('loads the real map client resource referenced by the rendered WebView', async () => {
    const webView = screen.view.getByTestId('warnings_webview');
    const html: string = webView.props.source.html;
    const scriptUrl = `${defaultConfig.warnings.webViewUrl}/index.js`;
    expect(html).toContain('language="fi"');
    expect(html).toContain(`src="${scriptUrl}"`);
    expect(html).toContain(`refresh-interval="${defaultConfig.warnings.updateInterval! * 60000}"`);
    const { status, data } = await axiosClient({ url: scriptUrl, responseType: 'text' }, undefined, 'Warnings');
    expect(status).toBe(200);
    expect(typeof data).toBe('string');
    expect(data.length).toBeGreaterThan(0);
    expect(data.trimStart().toLowerCase()).not.toMatch(/^<!doctype html|^<html/);

    fireEvent(webView, 'message', { nativeEvent: { data: '640' } });
    expect(screen.view.getByTestId('warnings_webview').props.style.height).toBe(640);
  });

  it('keeps the WebView fallback for a country without a local warnings API', () => {
    expectWarningsSuccess();
    const requestCount = liveResponses.filter(({ url }) => url === warningsUrl).length;
    const countries = Object.keys(defaultConfig.warnings.apiUrl ?? {});
    expect(countries).not.toContain('SE');
    act(() => {
      screen.store.dispatch({
        type: SET_CURRENT_LOCATION,
        location: { ...location, id: 2673730, name: 'Stockholm', country: 'SE', lat: 59.33, lon: 18.06 },
      });
    });
    expect(screen.view.queryByTestId('warnings_panel')).toBeNull();
    expect(screen.view.getByTestId('warnings_webview')).toBeTruthy();
    expect(screen.store.getState().warnings.loading).toBe(false);
    expect(liveResponses.filter(({ url }) => url === warningsUrl)).toHaveLength(requestCount);
  });
});

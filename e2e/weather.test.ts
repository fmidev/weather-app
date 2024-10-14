import { getByID } from './utils';

describe('Weather', () => {
  const navWeather = getByID('navigation_weather');
  const weatherView = getByID('weather_view');
  const weatherScrollView = getByID('weather_scrollview');
  const forecastTableButton = getByID('forecast_table_button');
  const forecastChartButton = getByID('forecast_chart_button');
  const forecastTable = getByID('forecast_table');
  const forecastChart = getByID('forecast_chart');
  const observationListButton = getByID('observation_list_button');
  const observationChartButton = getByID('observation_chart_button');
  const observationListHeader = getByID('observation_list_header_weather');
  const observationChart = getByID('chart_weather');
  const paramsButton = getByID('params_button');
  const paramsCloseButton = getByID('weather_params_bottom_sheet_close_button');
  const paramsBottomSheet = getByID('weather_params_bottom_sheet');
  const infoButton = getByID('info_button');
  const infoCloseButton = getByID('weather_info_bottom_sheet_close_button');
  const infoBottomSheet = getByID('weather_info_bottom_sheet');

  beforeAll(async () => {
    await device.launchApp({
      launchArgs: {
        e2e: true,
      },
    });
  });

  it('should navigate to weather screen', async () => {
    await navWeather.tap();
    await expect(weatherView).toBeVisible();
  });

  it('should show table forecast', async () => {
    await weatherScrollView.scrollTo('top');
    await weatherScrollView.scroll(300, 'down')
    await forecastTableButton.tap();
    await expect(forecastTable).toBeVisible();
    await expect(forecastChart).not.toBeVisible();
  });

  it('should show params bottom sheet', async () => {
    await paramsButton.tap();
    await expect(paramsBottomSheet).toBeVisible();
    await paramsCloseButton.tap();
    await expect(paramsBottomSheet).not.toBeVisible();
  });

  it('should show info bottom sheet', async () => {
    await infoButton.tap();
    await expect(infoBottomSheet).toBeVisible();
    await infoCloseButton.tap();
    await expect(infoBottomSheet).not.toBeVisible();
  });

  it('should show chart forecast', async () => {
    await weatherScrollView.scrollTo('top');
    await weatherScrollView.scroll(300, 'down')
    await forecastChartButton.tap();
    await expect(forecastChart).toBeVisible();
    await expect(forecastTable).not.toBeVisible();
  });

  it('should show weather observation chart', async () => {
    await weatherScrollView.scrollTo('bottom');
    await observationChartButton.tap();
    await expect(observationChart).toBeVisible();
  });

  it('should show weather observation list', async () => {
    await weatherScrollView.scrollTo('bottom');
    await observationListButton.tap();
    await expect(observationListHeader).toBeVisible();
  });


});
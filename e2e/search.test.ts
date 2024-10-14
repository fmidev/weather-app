import { getByID } from './utils';

describe('Search', () => {
  const navWeather = getByID('navigation_weather');
  const searchButton = getByID('search_header_button');
  const searchView = getByID('search_view');
  const searchInput = getByID('search_input');
  const searchText = 'Liperi';
  const weatherView = getByID('weather_view');
  const clearSearchButton = getByID('search_clear_button');
  const timeout = 5000;

  beforeAll(async () => {
    await device.launchApp({
      launchArgs: {
        e2e: true,
      },
    });
  });

  it('should navigate to search screen', async () => {
    await navWeather.tap();
    await searchButton.tap();
    await expect(searchView).toBeVisible();
  });

  it('should show search results', async () => {
    const result = element(by.id('search_result_text').and(by.text(searchText)))
    await searchInput.typeText(searchText);
    await waitFor(result).toBeVisible().withTimeout(timeout)
    await result.tap();
    await expect(weatherView).toBeVisible();
  });

  it('should clear the search text', async () => {
    await navWeather.tap();
    await searchButton.tap();
    await searchInput.typeText(searchText);
    await clearSearchButton.tap();
    await expect(searchInput).toHaveText('');
  });

});
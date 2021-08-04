import { device } from 'detox';
import { getByID } from './utils';

describe('Navigation', () => {
  // elements
  const navMap = getByID('navigation_map');
  const navForecast = getByID('navigation_forecast');
  const navWarnings = getByID('navigation_warnings');
  const navOthers = getByID('navigation_others');
  const navSymbols = getByID('navigation_symbols');
  const navSettings = getByID('navigation_settings');
  const navNotifications = getByID('navigation_notifications');
  const navAbout = getByID('navigation_about');
  const headerBack = getByID('header-back');
  const map = getByID('map');
  const clearSymbol = getByID('1');
  const languageHeader = getByID('settings_language_header');
  const themeHeader = getByID('settings_theme_header');
  // placeholders
  const placeholder = 'screen_placeholder_text';
  const forecastPlaceholder = 'Täällä olisi havaintoa ja ennustetta';
  const warningsPlaceholder = 'Tänne tulisi varoitukset';
  const aboutPlaceholder = 'Täällä lukisi tietoja sovelluksesta';
  const notificationsPlacehodler = 'Täälä olisi jotain notifikaatioista';

  // test
  it('should navigate to map screen', async () => {
    navMap.tap();
    await expect(map).toBeVisible();
  });

  it('should navigate to forecast screen', async () => {
    navForecast.tap();
    await expect(getByID(`${placeholder}_1`)).toHaveText(forecastPlaceholder);
  });

  it('should navigate to warnings screen', async () => {
    navWarnings.tap();
    await expect(getByID(`${placeholder}_2`)).toHaveText(warningsPlaceholder);
  });

  it('should navigate to others screen', async () => {
    navOthers.tap();
    await expect(navSymbols).toExist();
  });

  it('should navigate to each screen on others screen', async () => {
    navOthers.tap();
    await expect(navSymbols).toExist();
    navSymbols.tap();
    await expect(clearSymbol).toBeVisible();
    headerBack.tap();
    await expect(navSettings).toExist();
    navSettings.tap();
    await expect(languageHeader).toExist();
    await expect(themeHeader).toExist();
    headerBack.tap();
    await expect(navNotifications).toExist();
    navNotifications.tap();
    await expect(getByID(`${placeholder}_6`)).toHaveText(
      notificationsPlacehodler
    );
    headerBack.tap();
    await expect(navAbout).toExist();
    navAbout.tap();
    await expect(getByID(`${placeholder}_3`)).toHaveText(aboutPlaceholder);
  });
});

export {};

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
  const clearSymbol = getByID('clear');
  // placeholders
  const placeholder = 'screen_placeholder_text';
  const forecastPlaceholder = 'Tähän tulisi havaintoa ja ennustetta';
  const warningsPlaceholder = 'Tänne tulisi varoitukset';
  const aboutPlaceholder = 'Täällä lukisi tietoja sovelluksesta lyhyesti';
  const settingsPlaceholder =
    'Täällä olisi vaikka sovelluksen yleiset asetukset';
  const notificationsPlacehodler = 'Täällä olisi jotain notifikaatioista';
  // test
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES', location: 'always' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

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
    await expect(getByID(`${placeholder}_4`)).toHaveText(settingsPlaceholder);
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

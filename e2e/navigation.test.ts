import { device } from 'detox';
import { getByID } from './utils';

describe('Navigation', () => {
  // elements
  const navMap = getByID('navigation_map');
  const navForecast = getByID('navigation_forecast');
  const navWarnings = getByID('navigation_warnings');
  const navOthers = getByID('navigation_others');
  const navProduct = getByID('navigation_product');
  const navSettings = getByID('navigation_settings');
  const navNotifications = getByID('navigation_notifications');
  const navAbout = getByID('navigation_about');
  const headerBack = getByID('header-back');
  // palceholders
  const placeholder = 'screen_placeholder_text';
  const mapPlaceholder = 'Tähän tulisi kartta';
  const forecastPlaceholder = 'Tähän tulisi havaintoa ja ennustetta';
  const warningsPlaceholder = 'Tänne tulisi varoitukset';
  const aboutPlaceholder = 'Täällä lukisi tietoja sovelluksesta lyhyesti';
  const settingsPlaceholder =
    'Täällä olisi vaikka sovelluksen yleiset asetukset';
  const productPlaceholder = 'Täällä voisi olla mitä vain';
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
    await expect(getByID(`${placeholder}_0`)).toHaveText(mapPlaceholder);
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
    await expect(navProduct).toExist();
  });

  it('should navigate to each screen on others screen', async () => {
    navOthers.tap();
    await expect(navProduct).toExist();
    navProduct.tap();
    await expect(getByID(`${placeholder}_5`)).toHaveText(productPlaceholder);
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

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
  const versionInfo = getByID('about_version_info');
  // placeholders
  const placeholder = 'screen_placeholder_text';

  // test
  it('should navigate to map screen', async () => {
    navMap.tap();
    await expect(map).toBeVisible();
  });

  it('should navigate to forecast screen', async () => {
    navForecast.tap();
    await expect(getByID(`${placeholder}_1`)).toBeVisible();
  });

  it('should navigate to warnings screen', async () => {
    navWarnings.tap();
    await expect(getByID(`${placeholder}_2`)).toBevisible();
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
    await expect(languageHeader).toBeVisible();
    await expect(themeHeader).toBeVisible();
    headerBack.tap();
    await expect(navNotifications).toExist();
    navNotifications.tap();
    await expect(getByID(`${placeholder}_6`)).toBeVisible();
    headerBack.tap();
    await expect(navAbout).toExist();
    navAbout.tap();
    await expect(versionInfo).toBeVisible();
  });
});

export {};

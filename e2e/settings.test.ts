import { device } from 'detox';
import { getByID } from './utils';

describe('Settings', () => {
  // elements
  const navOthers = getByID('navigation_others');
  const navSettings = getByID('navigation_settings');
  const languageHeader = getByID('settings_language_header');
  const themeHeader = getByID('settings_theme_header');
  const setLanguageEn = getByID('settings_set_language_en');
  const setLanguageFi = getByID('settings_set_language_fi');
  const setThemeLight = getByID('settings_set_theme_light');
  const setThemeDark = getByID('settings_set_theme_dark');
  const setThemeAutomatic = getByID('settings_set_theme_automatic');
  const lightThemeCheck = getByID('settings_theme_light');
  const darkThemeCheck = getByID('settings_theme_dark');
  const automaticThemeCheck = getByID('settings_theme_automatic');

  const settingsLanguageTitleEn = 'Language';
  const settingsLanguageTitleFi = 'Kieli';
  // test
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES', location: 'always' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to settings screen', async () => {
    navOthers.tap();
    await expect(navSettings).toBeVisible();
    navSettings.tap();
    await expect(languageHeader).toExist();
    await expect(themeHeader).toExist();
  });

  it('should change language', async () => {
    navOthers.tap();
    await expect(navSettings).toBeVisible();
    navSettings.tap();
    await expect(languageHeader).toExist();
    setLanguageEn.tap();
    await expect(languageHeader).toHaveText(settingsLanguageTitleEn);
    setLanguageFi.tap();
    await expect(languageHeader).toHaveText(settingsLanguageTitleFi);
  });

  it('should change theme', async () => {
    navOthers.tap();
    await expect(navSettings).toBeVisible();
    navSettings.tap();
    await expect(themeHeader).toExist();
    setThemeDark.tap();
    await expect(darkThemeCheck).toExist();
    await expect(lightThemeCheck).not.toExist();
    await expect(automaticThemeCheck).not.toExist();
    setThemeAutomatic.tap();
    await expect(darkThemeCheck).not.toExist();
    await expect(lightThemeCheck).not.toExist();
    await expect(automaticThemeCheck).toExist();
    setThemeLight.tap();
    await expect(darkThemeCheck).not.toExist();
    await expect(lightThemeCheck).toExist();
    await expect(automaticThemeCheck).not.toExist();
  });
});

export {};

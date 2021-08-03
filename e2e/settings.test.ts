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
});

export {};

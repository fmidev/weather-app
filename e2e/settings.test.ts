import { device } from 'detox';
import { getByID } from './utils';

describe('Settings', () => {
  // elements
  const navOthers = getByID('navigation_others');
  const navSettings = getByID('navigation_settings');
  const languageHeader = getByID('settings_language_header');
  const themeHeader = getByID('settings_theme_header');
  const unitsHeader = getByID('settings_units_header');
  const setLanguageEn = getByID('settings_set_language_en');
  const setLanguageFi = getByID('settings_set_language_fi');
  const setThemeLight = getByID('settings_set_theme_light');
  const setThemeDark = getByID('settings_set_theme_dark');
  const setThemeAutomatic = getByID('settings_set_theme_automatic');
  const lightThemeCheck = getByID('settings_theme_light');
  const darkThemeCheck = getByID('settings_theme_dark');
  const automaticThemeCheck = getByID('settings_theme_automatic');
  const setTemperature = getByID('settings_set_temperature');
  const temperatureSheetTitle = getByID('temperature_unit_sheet_title');
  const setTemperatureFahrenheit = getByID(
    'settings_units_temperature_fahrenheit'
  );
  const unitSheetContainer = getByID('unit_sheet_container');
  const temperatureUnitAbb = getByID('temperature_unitAbb');

  // texts
  const settingsLanguageTitleEn = 'Language';
  const settingsLanguageTitleFi = 'Kieli';
  const fahrenheitAbb = '°F';

  // test
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

  it('should change temperature to Fahrenheit', async () => {
    navOthers.tap();
    await expect(navSettings).toBeVisible();
    navSettings.tap();
    await expect(unitsHeader).toExist();
    setTemperature.tap();
    await expect(temperatureSheetTitle).toBeVisible();
    setTemperatureFahrenheit.tap();
    unitSheetContainer.swipe('down');
    await expect(temperatureUnitAbb).toHaveText(fahrenheitAbb);
  });
});

export {};

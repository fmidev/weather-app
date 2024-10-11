import { getByID } from './utils';

describe('Settings', () => {
  // elements
  const navOthers = getByID('navigation_others');
  const navSettings = getByID('navigation_settings');
  const settingsScrollView = getByID('settings_scrollview');
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

  beforeAll(async () => {
    await device.launchApp({
      launchArgs: {
        e2e: true,
      },
    });
  });

  // test
  it('should navigate to settings screen', async () => {
    await navOthers.tap();
    await expect(navSettings).toBeVisible();
    await navSettings.tap();
    await expect(languageHeader).toExist();
    await expect(themeHeader).toExist();
  });

  it('should change language', async () => {
    await navOthers.tap();
    await expect(navSettings).toBeVisible();
    await navSettings.tap();
    await expect(languageHeader).toExist();
    await setLanguageEn.tap();
    await expect(languageHeader).toHaveText(settingsLanguageTitleEn);
    await setLanguageFi.tap();
    await expect(languageHeader).toHaveText(settingsLanguageTitleFi);
  });

  it('should change theme', async () => {
    await navOthers.tap();
    await expect(navSettings).toBeVisible();
    await navSettings.tap();
    await expect(themeHeader).toExist();
    await settingsScrollView.scrollTo('bottom'); // Otherwise theme options might be not visible
    await setThemeDark.tap();
    await expect(darkThemeCheck).toExist();
    await expect(lightThemeCheck).not.toExist();
    await expect(automaticThemeCheck).not.toExist();
    await settingsScrollView.scrollTo('bottom');
    await setThemeAutomatic.tap();
    await expect(darkThemeCheck).not.toExist();
    await expect(lightThemeCheck).not.toExist();
    await expect(automaticThemeCheck).toExist();
    await settingsScrollView.scrollTo('bottom');
    await setThemeLight.tap();
    await expect(darkThemeCheck).not.toExist();
    await expect(lightThemeCheck).toExist();
    await expect(automaticThemeCheck).not.toExist();
  });

  it('should change temperature to Fahrenheit', async () => {
    await navOthers.tap();
    await expect(navSettings).toBeVisible();
    await navSettings.tap();
    await expect(unitsHeader).toExist();
    await setTemperature.tap();
    await expect(temperatureSheetTitle).toBeVisible();
    await setTemperatureFahrenheit.tap();
    await unitSheetContainer.swipe('down');
    await expect(temperatureUnitAbb).toHaveText(fahrenheitAbb);
  });
});

export {};

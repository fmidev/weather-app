import { device } from 'detox';
import { getByID } from './utils';

describe('Navigation', () => {
  // elements
  const navMap = getByID('navigation_map');
  const navWeather = getByID('navigation_weather');
  const navWarnings = getByID('navigation_warnings');
  const navOthers = getByID('navigation_others');
  const navSettings = getByID('navigation_settings');
  const navAbout = getByID('navigation_about');
  const navTermsAndConditions = getByID('navigation_terms_and_conditions');
  const navAccessibility = getByID('navigation_accessibility');
  const navFeedback = getByID('navigation_feedback');
  const headerBack = getByID('header-back');
  const map = getByID('map');
  const languageHeader = getByID('settings_language_header');
  const themeHeader = getByID('settings_theme_header');
  const versionInfo = getByID('about_version_info');

  beforeAll(async () => {
    await device.launchApp({
      launchArgs: {
        e2e: true,
      }
    });
  });

  // test
  it('should navigate to map screen', async () => {
    await navMap.tap();
    await expect(map).toBeVisible();
  });

  it('should navigate to weather screen', async () => {
    await navWeather.tap();
    await expect(getByID('weather_view')).toBeVisible();
  });

  it('should navigate to warnings screen', async () => {
    await navWarnings.tap();
    await expect(getByID('warnings_view')).toBeVisible();
  });

  it('should navigate to others screen', async () => {
    await navOthers.tap();
    await expect(getByID('others_view')).toBeVisible();
  });

  it('should navigate to each screen on others screen', async () => {
    await navOthers.tap();
    await expect(navSettings).toExist();
    // Settings
    await navSettings.tap();
    await expect(languageHeader).toBeVisible();
    await expect(themeHeader).toBeVisible();
    await headerBack.tap();
    // About
    await expect(navAbout).toExist();
    await navAbout.tap();
    await expect(versionInfo).toBeVisible();
    await headerBack.tap();
    // Terms and Conditions
    await expect(navTermsAndConditions).toExist();
    await navTermsAndConditions.tap();
    await expect(getByID('terms_and_conditions_view')).toBeVisible()
    await headerBack.tap();
    // Accessibility
    await expect(navAccessibility).toExist();
    await navAccessibility.tap();
    await expect(getByID('accessibility_view')).toBeVisible()
    await headerBack.tap();
    // Feedback
    await expect(navFeedback).toExist();
    await navFeedback.tap();
    await expect(getByID('feedback_button')).toBeVisible()
    await headerBack.tap();
  });
});

export {};

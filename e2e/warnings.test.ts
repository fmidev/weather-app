import { getByID } from './utils';

describe('Warnings', () => {
  const navWarnings = getByID('navigation_warnings');
  const warningsView = getByID('warnings_view');
  const warningsPanel= getByID('warnings_panel');
  const warningsWebView = getByID('warnings_webview');
  const warningsScrollView = getByID('warnings_scrollview');
  const infoButton = getByID('warnings_info_button');
  const infoBottomSheet = getByID('warnings_info_bottom_sheet');
  const infoCloseButton = getByID('warnings_info_bottom_sheet_close_button');
  const searchButton = getByID('search_header_button');
  const searchView = getByID('search_view');
  const searchInput = getByID('search_input');
  const searchText = 'Berliini';
  const searchResultText = 'Berliini, Saksa';
  const timeout = 5000;

  beforeAll(async () => {
    await device.launchApp({
      launchArgs: {
        e2e: true,
      },
    });
  });

  it('should navigate to warnings screen', async () => {
    await navWarnings.tap();
    await expect(warningsView).toBeVisible();
  });

  it('should have warnings panel and webview for Smartmet Alert Client', async () => {
    await expect(warningsPanel).toBeVisible();
    await warningsScrollView.scrollTo('bottom');
    await expect(warningsWebView).toBeVisible(50);
  });

  it('should show info bottom sheet', async () => {
    await warningsScrollView.scrollTo('top');
    await infoButton.tap();
    await expect(infoBottomSheet).toBeVisible();
    await infoCloseButton.tap();
    await expect(infoBottomSheet).not.toBeVisible();
  });

  it('should not show warnings panel for foreign locations', async () => {
    await searchButton.tap();
    await expect(searchView).toBeVisible();
    await searchInput.typeText(searchText);
    const result = element(by.id('search_result_text').and(by.text(searchResultText)))
    await waitFor(result).toBeVisible().withTimeout(timeout)
    await result.tap();
    await expect(warningsView).toBeVisible();
    await expect(warningsPanel).not.toBeVisible();
    await warningsScrollView.scrollTo('bottom');
    await expect(warningsWebView).toBeVisible(50);
  });

});

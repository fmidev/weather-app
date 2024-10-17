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

  it('should have daily view and webview for Smartmet Alert Client', async () => {
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
});

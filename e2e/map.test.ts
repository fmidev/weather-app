import { getByID } from './utils';

describe('Map', () => {
  const navMap = getByID('navigation_map');
  const map = getByID('map');
  const infoButton = getByID('map_info_button');
  const infoBottomSheet = getByID('info_bottom_sheet');
  const infoCloseButton = getByID('info_bottom_sheet_close_button');
  const layersButton = getByID('map_layers_button');
  const layersBottomSheet = getByID('map_layers_bottom_sheet');
  const layersCloseButton = getByID('layers_bottom_sheet_close_button');

  beforeAll(async () => {
    await device.launchApp({
      launchArgs: {
        e2e: true,
      },
    });
  });

  it('should navigate to map screen', async () => {
    await navMap.tap();
    await expect(map).toBeVisible();
  });

  it('should show info bottom sheet', async () => {
    await infoButton.tap();
    await expect(infoBottomSheet).toBeVisible();
    await infoCloseButton.tap();
    await expect(infoBottomSheet).not.toBeVisible();
  });

  it('should show layers bottom sheet', async () => {
    await layersButton.tap();
    await expect(layersBottomSheet).toBeVisible();
    await layersCloseButton.tap();
    await expect(layersBottomSheet).not.toBeVisible();
  });

});
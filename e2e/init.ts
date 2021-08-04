import detox, { device } from 'detox';

// setup detox tests
beforeAll(async () => {
  await device.launchApp({
    permissions: { notifications: 'YES', location: 'always' },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

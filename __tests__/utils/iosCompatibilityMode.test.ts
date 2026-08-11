import { NativeModules, Platform } from 'react-native';

import { isRunningInIOSCompatibilityMode } from '../../src/utils/iosCompatibilityMode';

const originalPlatform = Platform.OS;

describe('isRunningInIOSCompatibilityMode', () => {
  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    delete NativeModules.IOSCompatibilityMode;
  });

  it('returns the value reported by the iOS native module', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    NativeModules.IOSCompatibilityMode = {
      isRunningOnMac: jest.fn().mockResolvedValue(true),
    };

    await expect(isRunningInIOSCompatibilityMode()).resolves.toBe(true);
  });

  it('returns false outside iOS without calling the native module', async () => {
    const isRunningOnMac = jest.fn().mockResolvedValue(true);
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    NativeModules.IOSCompatibilityMode = { isRunningOnMac };

    await expect(isRunningInIOSCompatibilityMode()).resolves.toBe(false);
    expect(isRunningOnMac).not.toHaveBeenCalled();
  });

  it('returns false when the native module is unavailable', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });

    await expect(isRunningInIOSCompatibilityMode()).resolves.toBe(false);
  });
});

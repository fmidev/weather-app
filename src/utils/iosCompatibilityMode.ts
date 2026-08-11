import { NativeModules, Platform } from 'react-native';

type IOSCompatibilityModeNativeModule = {
  isRunningOnMac: () => Promise<boolean>;
};

/**
 * Returns true when the iOS application is running on an Apple silicon Mac
 * using the iOS app compatibility environment. Mac Catalyst is not included.
 */
export const isRunningInIOSCompatibilityMode = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const nativeModule = NativeModules.IOSCompatibilityMode as
    | IOSCompatibilityModeNativeModule
    | undefined;

  return nativeModule ? nativeModule.isRunningOnMac() : false;
};

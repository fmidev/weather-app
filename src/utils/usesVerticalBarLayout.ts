import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

type VerticalBarLayoutModule = {
  getUsesVerticalBarLayout: () => Promise<boolean>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

/** Whether iOS places system controls in a vertical bar in the active window. */
const useVerticalBarLayout = (): boolean => {
  const [vertical, setVertical] = useState(false);
  const nativeModule =
    Platform.OS === 'ios'
      ? (NativeModules.VerticalBarLayout as VerticalBarLayoutModule | undefined)
      : undefined;

  useEffect(() => {
    if (!nativeModule) return;

    let active = true;
    let receivedChange = false;
    const emitter = new NativeEventEmitter(nativeModule);
    const subscription = emitter.addListener(
      'verticalBarLayoutDidChange',
      (value: unknown) => {
        if (!active || typeof value !== 'boolean') return;
        receivedChange = true;
        setVertical(value);
      }
    );

    const readLayout = async () => {
      try {
        const value = await nativeModule.getUsesVerticalBarLayout();
        // A layout change takes precedence over an older initial response.
        if (active && !receivedChange) setVertical(value);
      } catch {
        // Keep the map controls available if the native query fails.
      }
    };
    readLayout();

    return () => {
      active = false;
      subscription.remove();
    };
  }, [nativeModule]);

  return nativeModule ? vertical : false;
};

export { useVerticalBarLayout as usesVerticalBarLayout };

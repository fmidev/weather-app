import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { ReloaderContext } from '@utils/reloader';
import { Config } from './DynamicConfig';
import { ConfigType } from './types';
import { VERSION, DYNAMICCONFIG } from '@utils/async_storage';
import packageJSON from '../../package.json';

type ConfigProviderProps = {
  defaultConfig: ConfigType;
  children: React.ReactNode;
  timeout?: number;
};

const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  defaultConfig,
  timeout,
}) => {
  const reloadInterval = 60000;
  const [restored, setRestored] = useState<boolean>(false);
  const [updated, setUpdated] = useState<number>(0);
  const [shouldReload, setShouldReload] = useState<number>(0);
  const reloadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!Config.hasBeenSet) {
    Config.setDefaultConfig(defaultConfig);
  }

  if (timeout) {
    Config.setApiTimeout(timeout);
  }
  const { enabled, interval } = Config.get('dynamicConfig');

  const restoreStoredConfiguration = async () => {
    const storage = new MMKV();
    const storedConfig = storage.getString(DYNAMICCONFIG);
    const storedVersion = storage.getString(VERSION);

    if (storedConfig && storedVersion === packageJSON.version) {
      Config.setDefaultConfig(JSON.parse(storedConfig));
      setRestored(true);
    }
  };

  const checkUpdates = useCallback(async () => {
    if (Config.getUpdatingStatus()) {
      return;
    }
    const now = Date.now();
    if (interval && updated < now - interval * 60 * 1000) {
      await Config.update();
      setUpdated(now);
    }
    setShouldReload(now);
  }, [updated, interval]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (enabled) {
          checkUpdates();
        } else {
          setShouldReload(Date.now());
        }

        reloadIntervalRef.current = setInterval(
          () => setShouldReload(Date.now()),
          reloadInterval
        );
      } else {
        if (reloadIntervalRef.current) {
          clearInterval(reloadIntervalRef.current);
        }
      }
    };
    const appStateSubscriber = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => appStateSubscriber.remove();
  }, [checkUpdates, enabled]);

  useEffect(() => {
    if (enabled && !restored) {
      restoreStoredConfiguration().then(() => {
        checkUpdates();
      });
    }
  }, [enabled, checkUpdates, restored]);

  useEffect(() => {
    reloadIntervalRef.current = setInterval(
      () => setShouldReload(Date.now()),
      reloadInterval
    );
  }, []);

  return (
    <>
      {(!enabled || restored || updated > 0) && (
        <ReloaderContext.Provider value={{ shouldReload }}>
          {children}
        </ReloaderContext.Provider>
      )}
    </>
  );
};

export default ConfigProvider;

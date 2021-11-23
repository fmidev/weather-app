import React, { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { ReloaderContext } from '@utils/reloader';
import { Config } from './DynamicConfig';
import { ConfigType } from './types';

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
  const [updated, setUpdated] = useState<number>(0);
  const [shouldReload, setShouldReload] = useState<number>(0);

  Config.setDefaultConfig(defaultConfig);
  if (timeout) {
    Config.setApiTimeout(timeout);
  }
  const { enabled, interval } = Config.get('dynamicConfig');

  const checkUpdates = useCallback(async () => {
    if (Config.getUpdatingStatus()) {
      return;
    }
    const now = Date.now();
    if (interval && updated < now - interval * 1000) {
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
      }
    };
    AppState.addEventListener('change', handleAppStateChange);

    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, [checkUpdates, enabled]);

  useEffect(() => {
    checkUpdates();
  }, [checkUpdates]);

  return (
    <>
      {(!enabled || updated > 0) && (
        <ReloaderContext.Provider value={{ shouldReload }}>
          {children}
        </ReloaderContext.Provider>
      )}
    </>
  );
};

export default ConfigProvider;

import React, { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
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
  Config.setDefaultConfig(defaultConfig);
  if (timeout) {
    Config.setApiTimeout(timeout);
  }
  const { enabled, interval } = Config.get('dynamicConfig');

  const checkUpdates = useCallback(async () => {
    if (
      !Config.getUpdatingStatus() &&
      interval &&
      updated < Date.now() - interval * 1000
    ) {
      await Config.update();
      setUpdated(Date.now());
    }
  }, [updated, interval]);

  useEffect(() => {
    if (!enabled) {
      return () => null;
    }

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        checkUpdates();
      }
    };
    AppState.addEventListener('change', handleAppStateChange);

    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, [checkUpdates, enabled]);

  useEffect(() => {
    if (enabled) {
      checkUpdates();
    }
  }, [checkUpdates, enabled]);

  return <>{(!enabled || updated > 0) && children}</>;
};

export default ConfigProvider;

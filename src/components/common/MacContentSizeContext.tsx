import React, { createContext, PropsWithChildren, useContext } from 'react';

type MacContentSizeContextValue = {
  isRunningOnMac: boolean;
  isPlatformDetectionComplete: boolean;
};

const MacContentSizeContext = createContext<MacContentSizeContextValue>({
  isRunningOnMac: false,
  isPlatformDetectionComplete: true,
});

type MacContentSizeProviderProps = PropsWithChildren<{
  isRunningOnMac: boolean;
  isPlatformDetectionComplete: boolean;
}>;

export const MacContentSizeProvider: React.FC<MacContentSizeProviderProps> = ({
  children,
  isRunningOnMac,
  isPlatformDetectionComplete,
}) => (
  <MacContentSizeContext.Provider
    value={{ isRunningOnMac, isPlatformDetectionComplete }}>
    {children}
  </MacContentSizeContext.Provider>
);

export const useIsRunningOnMac = () =>
  useContext(MacContentSizeContext).isRunningOnMac;

export const useIsPlatformDetectionComplete = () =>
  useContext(MacContentSizeContext).isPlatformDetectionComplete;

import React, { createContext, PropsWithChildren, useContext } from 'react';

const MacContentSizeContext = createContext(false);

type MacContentSizeProviderProps = PropsWithChildren<{
  isRunningOnMac: boolean;
}>;

export const MacContentSizeProvider: React.FC<MacContentSizeProviderProps> = ({
  children,
  isRunningOnMac,
}) => (
  <MacContentSizeContext.Provider value={isRunningOnMac}>
    {children}
  </MacContentSizeContext.Provider>
);

export const useIsRunningOnMac = () => useContext(MacContentSizeContext);

import React from 'react';

type ReloaderContextType = {
  shouldReload: number;
};

const ReloaderContext = React.createContext<ReloaderContextType>({
  shouldReload: 0,
});

export const useReloader = () => React.useContext(ReloaderContext);
export { ReloaderContext };

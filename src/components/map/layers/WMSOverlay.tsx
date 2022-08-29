import React, { useState, useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '@utils/map';

import { State } from '@store/types';
import { Layer, MapOverlay } from '@store/map/types';
import { selectActiveOverlay, selectSliderTime } from '@store/map/selectors';
import { useTheme, useIsFocused } from '@react-navigation/native';
import packageJSON from '../../../../package.json';
import MemoizedWMSTile from './MemoizedWMSTile';

const mapStateToProps = (state: State) => ({
  activeOverlayId: selectActiveOverlay(state),
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type WMSOverlayProps = PropsFromRedux & {
  overlay: MapOverlay;
};

const WMSOverlay: React.FC<WMSOverlayProps> = ({
  activeOverlayId,
  sliderTime,
  overlay,
}) => {
  const { dark } = useTheme();
  const observation = overlay.observation as Layer;
  const forecast = overlay.forecast as Layer;
  const isFocused = useIsFocused();

  const [borderTime, setBorderTime] = useState<{
    time: string;
    type: 'observation' | 'forecast';
  }>({ time: moment.utc().toISOString(), type: 'observation' });
  const [urlMap, setUrlMap] = useState<Map<string, string>>(new Map());

  const updateUrlMap = (k: string, v: string) => {
    setUrlMap(new Map(urlMap.set(k, v)));
  };
  const current = moment.unix(sliderTime).toISOString();

  const currentStep = getSliderStepSeconds(overlay.step);

  const memoizedMinUnix = useMemo(
    () => getSliderMinUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );
  const memoizedMaxUnix = useMemo(
    () => getSliderMaxUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );

  const formatUrlWithStyles = (timestamp: string): string | false => {
    const isForecast = borderTimeComparer(timestamp);
    const { url, styles } = (isForecast ? forecast : observation) || {};
    if (!url) {
      return false;
    }
    const theme = dark ? 'dark' : 'light';
    return `${url}&styles=${
      typeof styles === 'string' ? styles : styles[theme]
    }&time=${timestamp}&who=${packageJSON.name}`;
  };

  const borderTimeComparer = (time: string): boolean =>
    borderTime.type === 'forecast'
      ? time >= borderTime.time
      : time > borderTime.time;

  useEffect(() => {
    if (forecast && forecast.start) {
      if (observation && observation.end) {
        setBorderTime({ time: observation.end, type: 'observation' });
      } else {
        setBorderTime({ time: forecast.start, type: 'forecast' });
      }
    }
    if (!forecast && observation && observation.end) {
      setBorderTime({ time: observation.end, type: 'observation' });
    }
  }, [forecast, observation]);

  useEffect(() => {
    if (!!observation?.url || !!forecast?.url) {
      let allDatesUnix: number[] = [];
      let curr = memoizedMinUnix;
      while (curr <= memoizedMaxUnix) {
        allDatesUnix = allDatesUnix.concat(curr);
        curr += currentStep;
      }
      const timeStamps = allDatesUnix.map((unix) =>
        moment.unix(unix).toISOString()
      );

      timeStamps.forEach((stamp) => {
        const formatted = formatUrlWithStyles(stamp);
        if (formatted) updateUrlMap(stamp, formatted);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observation, forecast]);
  if (!overlay.observation && !overlay.forecast) return null;

  // return null until something to return
  if (!urlMap || !urlMap.has(current) || sliderTime === 0 || !isFocused)
    return null;

  return (
    <MemoizedWMSTile
      urlTemplate={urlMap.get(current) as string}
      tileSize={overlay.tileSize}
    />
  );
};

export default connector(WMSOverlay);

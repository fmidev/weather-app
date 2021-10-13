import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Image, ImageURISource, Platform } from 'react-native';
import { Overlay } from 'react-native-maps';
import moment from 'moment';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '@utils/map';

import { State } from '@store/types';
import { MapOverlay } from '@store/map/types';
import { selectSliderTime, selectSliderStep } from '@store/map/selectors';

const mapStateToProps = (state: State) => ({
  sliderTime: selectSliderTime(state),
  sliderStep: selectSliderStep(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type RainRadarProps = PropsFromRedux & {
  overlay: MapOverlay;
};

const RainRadarOverlay: React.FC<RainRadarProps> = ({
  sliderTime,
  sliderStep,
  overlay,
}) => {
  const { observation, forecast } = overlay;
  const [hasPrefetched, setHasPrefetched] = useState<boolean>(false);
  const [forecastDateStart, setForecastDateStart] = useState<string>(
    moment.utc().toISOString()
  );

  const current = moment.unix(sliderTime).toISOString();
  const step60 = getSliderStepSeconds(60);
  const currentStep = getSliderStepSeconds(sliderStep);
  const roundStep = (v: number) => Math.round(v / step60) * step60;

  const minUnix = roundStep(getSliderMinUnix(60));
  const maxUnix = roundStep(getSliderMaxUnix(60));

  const prefetchImages = async (urls: string[]) => {
    try {
      return await Promise.all(urls.map((url) => Image.prefetch(url)));
    } catch (e) {
      return false;
    }
  };

  const checkCache = async (urls: string[]) => {
    try {
      if (Image.queryCache) {
        return await Image.queryCache(urls);
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (forecast && forecast.start) {
      setForecastDateStart(forecast.start);
    }
  }, [forecast]);

  useEffect(() => {
    if (!!observation && !!forecast && !!observation.url && !!forecast.url) {
      let allDatesUnix: number[] = [];
      let curr = minUnix;
      while (curr <= maxUnix) {
        allDatesUnix = allDatesUnix.concat(curr);
        curr += currentStep;
      }
      const timeStamps = allDatesUnix.map((unix) =>
        moment.unix(unix).toISOString()
      );

      const urls = timeStamps.map((stamp) => {
        const baseUrl =
          stamp >= forecastDateStart
            ? overlay.forecast.url
            : overlay.observation.url;
        return `${baseUrl}&time=${stamp}`;
      });

      prefetchImages(urls).then((data) => console.log('prefetch', data));

      // DEV: only to check if prefetch was succesful
      checkCache(urls).then((data) => console.log('cache', data));

      setHasPrefetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observation, forecast]);
  if (!overlay.observation && !overlay.forecast) return null;

  const layerBounds =
    current >= forecastDateStart
      ? (forecast.bounds as { [key: string]: [number, number] })
      : (observation.bounds as { [key: string]: [number, number] });

  const bounds: [[number, number], [number, number]] =
    Platform.OS === 'ios'
      ? [layerBounds.bottomLeft, layerBounds.topRight]
      : [layerBounds.topLeft, layerBounds.bottomRight];

  const baseUrl = current >= forecastDateStart ? forecast.url : observation.url;

  const image = baseUrl && (`${baseUrl}&time=${current}` as ImageURISource);

  // console.log('IMG', image, hasPrefetched);
  // wait until images are cached
  if (!hasPrefetched || !image || !bounds) return null;

  return <Overlay bounds={bounds} image={image} />;
};

export default connector(RainRadarOverlay);

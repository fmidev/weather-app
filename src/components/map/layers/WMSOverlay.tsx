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
import {
  selectActiveOverlay,
  selectSliderTime,
  selectSliderStep,
} from '@store/map/selectors';

const mapStateToProps = (state: State) => ({
  activeOverlayId: selectActiveOverlay(state),
  sliderTime: selectSliderTime(state),
  sliderStep: selectSliderStep(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type WMSOverlayProps = PropsFromRedux & {
  overlay: MapOverlay;
};

const WMSOverlay: React.FC<WMSOverlayProps> = ({
  activeOverlayId,
  sliderTime,
  sliderStep,
  overlay,
}) => {
  const { observation, forecast } = overlay;

  const [hasPrefetched, setHasPrefetched] = useState<boolean>(false);
  const [borderTime, setBorderTime] = useState<string>(
    moment.utc().toISOString()
  );

  const current = moment.unix(sliderTime).toISOString();
  const step60 = getSliderStepSeconds(60);
  const currentStep = getSliderStepSeconds(sliderStep);
  const roundStep = (v: number) => Math.round(v / step60) * step60;

  const minUnix = roundStep(getSliderMinUnix(activeOverlayId));
  const maxUnix = roundStep(getSliderMaxUnix(activeOverlayId));

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
      setBorderTime(forecast.start);
    }
    if (!forecast && observation && observation.end) {
      setBorderTime(observation.end);
    }
  }, [forecast, observation]);

  useEffect(() => {
    if (!!observation?.url || !!forecast?.url) {
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
        const baseUrl = stamp >= borderTime ? forecast?.url : observation?.url;
        if (!baseUrl) return false;
        return `${baseUrl}&time=${stamp}`;
      });

      const filteredUrls = urls.filter((x) => !!x) as string[];

      prefetchImages(filteredUrls).then((data) => {
        if (data) console.log('prefetch done');
      });

      // DEV: only to check if prefetch was succesful
      checkCache(filteredUrls).then((data) => {
        if (data) console.log('cache hit');
      });

      setHasPrefetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observation, forecast]);
  if (!overlay.observation && !overlay.forecast) return null;

  const layerBounds =
    current >= borderTime
      ? (forecast?.bounds as { [key: string]: [number, number] })
      : (observation?.bounds as { [key: string]: [number, number] });

  const bounds: [[number, number], [number, number]] =
    Platform.OS === 'ios'
      ? [layerBounds?.bottomLeft, layerBounds?.topRight]
      : [layerBounds?.topLeft, layerBounds?.bottomRight];

  const baseUrl = current >= borderTime ? forecast?.url : observation?.url;

  const image = baseUrl && (`${baseUrl}&time=${current}` as ImageURISource);
  console.log(image);
  // return null until something to return
  if (!hasPrefetched || !image || !bounds) return null;

  return <Overlay bounds={bounds} image={image} />;
};

export default connector(WMSOverlay);

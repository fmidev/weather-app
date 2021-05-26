import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Image, ImageURISource, Platform } from 'react-native';
import { Overlay } from 'react-native-maps';
import moment from 'moment';

import Config from 'react-native-config';

import { State } from '../store/types';
import { selectSliderTime } from '../store/map/selectors';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '../utils/helpers';

const mapStateToProps = (state: State) => ({
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type RainRadarProps = PropsFromRedux;

const BOUNDS = {
  bottomLeft: [56.75132000097737, 16.86743001103862], // left bottom, min y, min x
  bottomRight: [56.75132000097737, 37.37165999353797], // right bottom, min y, max x
  topRight: [70.98305999744711, 37.37165999353797], // top right, max y, max x,
  topLeft: [70.98305999744711, 16.86743001103862], // top left, max ly, min x
} as { [key: string]: [number, number] };

const OBSERVATION_URL = `http://wms.fmi.fi/fmi-apikey/${Config.API_KEY}/geoserver/Radar/wms?service=WMS&styles=&transparent=true&version=1.1.0&request=GetMap&layers=Radar%3Asuomi_rr_eureffin&bbox=1877673.71982%2C7709459.58195%2C4160194.16058%2C11396482.4557&width=485&height=768&srs=EPSG%3A3857&format=image%2Fpng`;
const FORECAST_URL = `http://wms.fmi.fi/fmi-apikey/${Config.API_KEY}/geoserver/Radar/wms?service=WMS&styles=&transparent=true&version=1.1.0&request=GetMap&layers=Radar%3Asuomi_tuliset_rr_eureffin&bbox=1877673.71982%2C7709459.58195%2C4160194.16058%2C11396482.4557&width=485&height=768&srs=EPSG%3A3857&format=image%2Fpng`;

const RainRadarOverlay: React.FC<RainRadarProps> = ({ sliderTime }) => {
  const [hasPrefetched, setHasPrefetched] = useState<boolean>(false);
  const current = moment.unix(sliderTime).toISOString();
  const now = moment.utc().toISOString();

  const step60 = getSliderStepSeconds(60);
  const step15 = getSliderStepSeconds(15);
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
    let allDatesUnix: number[] = [];
    let curr = minUnix;
    while (curr <= maxUnix) {
      allDatesUnix = allDatesUnix.concat(curr);
      curr += step15;
    }
    const timeStamps = allDatesUnix.map((unix) =>
      moment.unix(unix).toISOString()
    );

    const urls = timeStamps.map((stamp) => {
      const baseUrl = stamp > now ? FORECAST_URL : OBSERVATION_URL;
      return `${baseUrl}&time=${stamp}`;
    });

    prefetchImages(urls).then((data) => console.log('prefetch', data));

    // DEV: only to check if prefetch was succesful
    checkCache(urls).then((data) => console.log('cache', data));

    setHasPrefetched(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bounds: [[number, number], [number, number]] =
    Platform.OS === 'ios'
      ? [BOUNDS.bottomLeft, BOUNDS.topRight]
      : [BOUNDS.topLeft, BOUNDS.bottomRight];

  const baseUrl = current > now ? FORECAST_URL : OBSERVATION_URL;

  const image = `${baseUrl}&time=${current}` as ImageURISource;

  if (!hasPrefetched) return null;
  console.log(image);
  return <Overlay bounds={bounds} image={image} />;
};

export default connector(RainRadarOverlay);

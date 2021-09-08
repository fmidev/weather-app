import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Image, ImageURISource, Platform } from 'react-native';
import { Overlay } from 'react-native-maps';
import moment from 'moment';
import { parse } from 'fast-xml-parser';

import Config from 'react-native-config';

import { State } from '../../../store/types';
import { selectSliderTime } from '../../../store/map/selectors';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '../../../utils/helpers';

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

type WmsLayer = {
  // only these properties are needed for now
  Name: string;
  Extent: string;
};

const BASE_URL = `https://wms.fmi.fi/fmi-apikey/${Config.API_KEY}/geoserver/Radar/wms?service=WMS&version=1.1.0`;
const OBSERVATION_LAYER = 'suomi_rr_eureffin';
const FORECAST_LAYER = 'suomi_tuliset_rr_eureffin';
const OBSERVATION_URL = `${BASE_URL}&request=GetMap&styles=&transparent=true&layers=Radar%3A${OBSERVATION_LAYER}&bbox=1877673.71982%2C7709459.58195%2C4160194.16058%2C11396482.4557&width=1455&height=2304&srs=EPSG%3A3857&format=image%2Fpng`;
const FORECAST_URL = `${BASE_URL}&request=GetMap&styles=&transparent=true&layers=Radar%3A${FORECAST_LAYER}&bbox=1877673.71982%2C7709459.58195%2C4160194.16058%2C11396482.4557&width=1455&height=2304&srs=EPSG%3A3857&format=image%2Fpng`;

const RainRadarOverlay: React.FC<RainRadarProps> = ({ sliderTime }) => {
  const [hasPrefetched, setHasPrefetched] = useState<boolean>(false);
  const [forecastDateStart, setForecastDateStart] = useState<string>(
    moment.utc().toISOString()
  );
  const current = moment.unix(sliderTime).toISOString();

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

  const getCapabilities = async () => {
    const capabilitiesUrl = `${BASE_URL}&request=GetCapabilities`;
    fetch(capabilitiesUrl)
      .then((res) => res.text())
      .then((textRes) => {
        const obj = parse(textRes);
        // layers array is nested in the response as Layer
        const {
          WMT_MS_Capabilities: {
            Capability: {
              Layer: { Layer },
            },
          },
        } = obj;
        const layersArr = Layer.filter(
          (layer: WmsLayer) => layer.Name === FORECAST_LAYER
        );
        const forecastDateTimes = layersArr[0]?.Extent?.split('/');
        const firstForecastDate =
          forecastDateTimes &&
          forecastDateTimes.length > 0 &&
          forecastDateTimes[0];

        if (firstForecastDate) {
          setForecastDateStart(firstForecastDate);
        }
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    getCapabilities();
  }, []);

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
      const baseUrl =
        stamp >= forecastDateStart ? FORECAST_URL : OBSERVATION_URL;
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

  const baseUrl = current >= forecastDateStart ? FORECAST_URL : OBSERVATION_URL;

  const image = `${baseUrl}&time=${current}` as ImageURISource;

  // wait until images are cached
  if (!hasPrefetched) return null;

  return <Overlay bounds={bounds} image={image} />;
};

export default connector(RainRadarOverlay);

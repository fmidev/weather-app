import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Geojson } from 'react-native-maps';
import moment from 'moment';

import Config from 'react-native-config';

import { State } from '@store/types';
import { selectSliderTime } from '@store/map/selectors';

const mapStateToProps = (state: State) => ({
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type GeoJsonOverlayProps = PropsFromRedux;

const BASE_URL = `http://data.fmi.fi/fmi-apikey/${Config.API_KEY}/dali?customer=ireact&producer=ireact&product=temperature&type=geojson`;
const GeoJsonOverlay: React.FC<GeoJsonOverlayProps> = ({ sliderTime }) => {
  const [json, setJson] = useState<GeoJSON.GeoJSON | undefined>(undefined);

  useEffect(() => {
    if (sliderTime) {
      const current = moment.unix(sliderTime).format('YYYYMMDD[T]HHMM');
      const url = `${BASE_URL}&time=${current}`;
      fetch(url)
        .then((res) => res.text())
        .then((data) => {
          const asd = JSON.parse(data);
          setJson(asd);
        })
        .catch((e) => console.log(e));
    }
  }, [sliderTime]);

  if (!json) return null;
  return <Geojson geojson={json} />;
};

export default connector(GeoJsonOverlay);

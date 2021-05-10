import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ImageURISource, Platform } from 'react-native';
import { Overlay } from 'react-native-maps';
import moment from 'moment';

import Config from 'react-native-config';

import { State } from '../store/types';
import { selectSliderTime } from '../store/map/selectors';

const mapStateToProps = (state: State) => ({
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type RainRadarProps = PropsFromRedux;

const BOUNDS = {
  bottomLeft: [56.75131991843274, 10.215546158016812], // left bottom
  bottomRight: [56.75131991843274, 37.37165878453536], // right bottom
  topRight: [71.24172567164591, 37.37165878453536], // top right
  topLeft: [71.24172567164591, 10.215546158016812], // top left
} as { [key: string]: [number, number] };

const WMS_URL = `http://wms.fmi.fi/fmi-apikey/${Config.API_KEY}/geoserver/Radar/wms?service=WMS&styles=&transparent=true&version=1.1.0&request=GetMap&layers=Radar%3Asuomi_rr_eureffin&bbox=-118331.366408356%2C6335621.16701424%2C875567.731906565%2C7907751.53726352&width=485&height=768&srs=EPSG%3A3067&format=image%2Fpng`;

const RainRadarOverlay: React.FC<RainRadarProps> = ({ sliderTime }) => {
  const current = moment.unix(sliderTime).toISOString();
  // const now = moment.utc().toISOString();

  // const queryParams = new URLSearchParams({
  //   service: 'WMS',
  //   request: 'GetMap',
  //   layers: encodeURIComponent('Radar:suomi_dbz_eureffin'),
  //   transparent: 'true',
  //   version: '1.1.0',
  //   bbox: encodeURIComponent(
  //     '-118331.366408356,6335621.16701424,875567.731906565,7907751.53726352'
  //   ),
  //   srs: encodeURIComponent('EPSG:3067'),
  //   width: '485',
  //   height: '768',
  //   format: encodeURIComponent('image.png'),
  //   time: current,
  // });

  // const imageUrl = `http://wms.fmi.fi/fmi-apikey/${Config.API_KEY}/geoserver/Radar/wms?${queryParams}` as ImageURISource;

  const bounds: [[number, number], [number, number]] =
    Platform.OS === 'ios'
      ? [BOUNDS.bottomLeft, BOUNDS.topRight]
      : [BOUNDS.topLeft, BOUNDS.bottomRight];

  const image = `${WMS_URL}&=${current}` as ImageURISource;
  console.log(image);
  return <Overlay bounds={bounds} image={image} />;
};

export default connector(RainRadarOverlay);

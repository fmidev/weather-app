/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

import IonIcon from 'react-native-vector-icons/Ionicons';

import ArrowBack from '../assets/images/icons/arrow-back.svg';
import ArrowDown from '../assets/images/icons/arrow-down.svg';
import ArrowForward from '../assets/images/icons/arrow-forward.svg';
import ArrowLeft from '../assets/images/icons/arrow-left.svg';
import ArrowRight from '../assets/images/icons/arrow-right.svg';
import ArrowUp from '../assets/images/icons/arrow-up.svg';
import Close from '../assets/images/icons/close.svg';
import Info from '../assets/images/icons/info.svg';
import Layers from '../assets/images/icons/layers.svg';
import Locate from '../assets/images/icons/locate.svg';
import Map from '../assets/images/icons/map.svg';
import Menu from '../assets/images/icons/menu.svg';
import Mic from '../assets/images/icons/mic.svg';
import OpenInNew from '../assets/images/icons/open-in-new.svg';
import Pause from '../assets/images/icons/pause.svg';
import Play from '../assets/images/icons/play.svg';
import Plus from '../assets/images/icons/plus.svg';
import RadioButtonOff from '../assets/images/icons/radio-button-off.svg';
import RadioButtonOn from '../assets/images/icons/radio-button-on.svg';
import Search from '../assets/images/icons/search.svg';
import StarSelected from '../assets/images/icons/star-selected.svg';
import StarUnselected from '../assets/images/icons/star-unselected.svg';
import WarningsFloodLevel2 from '../assets/images/icons/warnings-flood-level-2.svg';
import WarningsFloodLevel3 from '../assets/images/icons/warnings-flood-level-3.svg';
import WarningsFloodLevel4 from '../assets/images/icons/warnings-flood-level-4.svg';
import WarningsForestFireWeatherOrange from '../assets/images/icons/warnings-forest-fire-weather-orange.svg';
import WarningsForestFireWeatherRed from '../assets/images/icons/warnings-forest-fire-weather-red.svg';
import WarningsForestFireWeatherYellow from '../assets/images/icons/warnings-forest-fire-weather-yellow.svg';
import WarningsGrassFireWeather from '../assets/images/icons/warnings-grass-fire-weather.svg';
import WarningsHotWeatherOrange from '../assets/images/icons/warnings-hot-weather-orange.svg';
import WarningsHotWeatherRed from '../assets/images/icons/warnings-hot-weather-red.svg';
import WarningsHotWeatherYellow from '../assets/images/icons/warnings-hot-weather-yellow.svg';
import WarningsPedestrianSafety from '../assets/images/icons/warnings-pedestrian-safety.svg';
import WarningsRainOrange from '../assets/images/icons/warnings-rain-orange.svg';
import WarningsRainRed from '../assets/images/icons/warnings-rain-red.svg';
import WarningsRainYellow from '../assets/images/icons/warnings-rain-yellow.svg';
import WarningsStatusOrange from '../assets/images/icons/warnings-status-orange.svg';
import WarningsThunderStormOrange from '../assets/images/icons/warnings-thunder-storm-orange.svg';
import WarningsThunderStormRed from '../assets/images/icons/warnings-thunder-storm-red.svg';
import WarningsThunderStormYellow from '../assets/images/icons/warnings-thunder-storm-yellow.svg';
import WarningsTrafficWeatherOrange from '../assets/images/icons/warnings-traffic-weather-orange.svg';
import WarningsTrafficWeatherYellow from '../assets/images/icons/warnings-traffic-weather-yellow.svg';
import WarningsUvNote from '../assets/images/icons/warnings-uv-note.svg';
import WarningsWindOrange from '../assets/images/icons/warnings-wind-orange.svg';
import WarningsWindRed from '../assets/images/icons/warnings-wind-red.svg';
import WarningsWindYellow from '../assets/images/icons/warnings-wind-yellow.svg';

import Warnings from '../assets/images/icons/warnings.svg';
import Weather from '../assets/images/icons/weather.svg';

type IconProps = {
  name: string;
  width?: number;
  height?: number;
  size?: number;
  style?: StyleProp<ViewStyle & TextStyle>;
};

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'arrow-back':
      return <ArrowBack {...props} />;
    case 'arrow-down':
      return <ArrowDown {...props} />;
    case 'arrow-forward':
      return <ArrowForward {...props} />;
    case 'arrow-left':
      return <ArrowLeft {...props} />;
    case 'arrow-right':
      return <ArrowRight {...props} />;
    case 'arrow-up':
      return <ArrowUp {...props} />;
    case 'close':
      return <Close {...props} />;
    case 'info':
      return <Info {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'locate':
      return <Locate {...props} />;
    case 'map':
      return <Map {...props} />;
    case 'menu':
      return <Menu {...props} />;
    case 'mic':
      return <Mic {...props} />;
    case 'open-in-new':
      return <OpenInNew {...props} />;
    case 'pause':
      return <Pause {...props} />;
    case 'play':
      return <Play {...props} />;
    case 'plus':
      return <Plus {...props} />;
    case 'radio-button-off':
      return <RadioButtonOff {...props} />;
    case 'radio-button-on':
      return <RadioButtonOn {...props} />;
    case 'search':
      return <Search {...props} />;
    case 'star-selected':
      return <StarSelected {...props} />;
    case 'star-unselected':
      return <StarUnselected {...props} />;
    case 'warnings-flood-level-2':
      return <WarningsFloodLevel2 {...props} />;
    case 'warnings-flood-level-3':
      return <WarningsFloodLevel3 {...props} />;
    case 'warnings-flood-level-4':
      return <WarningsFloodLevel4 {...props} />;
    case 'warnings-forest-fire-weather-orange':
      return <WarningsForestFireWeatherOrange {...props} />;
    case 'warnings-forest-fire-weather-red':
      return <WarningsForestFireWeatherRed {...props} />;
    case 'warnings-forest-fire-weather-yellow':
      return <WarningsForestFireWeatherYellow {...props} />;
    case 'warnings-grass-fire-weather':
      return <WarningsGrassFireWeather {...props} />;
    case 'warnings-hot-weather-orange':
    case 'warnings-cold-weather-orange':
      return <WarningsHotWeatherOrange {...props} />;
    case 'warnings-hot-weather-red':
    case 'warnings-cold-weather-red':
      return <WarningsHotWeatherRed {...props} />;
    case 'warnings-hot-weather-yellow':
    case 'warnings-cold-weather-yellow':
      return <WarningsHotWeatherYellow {...props} />;
    case 'warnings-pedestrian-safety':
      return <WarningsPedestrianSafety {...props} />;
    case 'warnings-rain-orange':
      return <WarningsRainOrange {...props} />;
    case 'warnings-rain-red':
      return <WarningsRainRed {...props} />;
    case 'warnings-rain-yellow':
      return <WarningsRainYellow {...props} />;
    case 'warnings-status-orange':
      return <WarningsStatusOrange {...props} />;
    case 'warnings-thunder-storm-orange':
      return <WarningsThunderStormOrange {...props} />;
    case 'warnings-thunder-storm-red':
      return <WarningsThunderStormRed {...props} />;
    case 'warnings-thunder-storm-yellow':
      return <WarningsThunderStormYellow {...props} />;
    case 'warnings-traffic-weather-orange':
      return <WarningsTrafficWeatherOrange {...props} />;
    case 'warnings-traffic-weather-yellow':
      return <WarningsTrafficWeatherYellow {...props} />;
    case 'warnings-uv-note':
      return <WarningsUvNote {...props} />;
    case 'warnings-wind-orange':
      return <WarningsWindOrange {...props} />;
    case 'warnings-wind-red':
      return <WarningsWindRed {...props} />;
    case 'warnings-wind-yellow':
      return <WarningsWindYellow {...props} />;
    case 'warnings':
      return <Warnings {...props} />;
    case 'weather':
      return <Weather {...props} />;
    default:
      return <IonIcon name={name} {...props} />;
  }
};

export default Icon;

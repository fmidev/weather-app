/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

import IonIcon from 'react-native-vector-icons/Ionicons';
import { IconProps } from 'react-native-vector-icons/Icon';

import ArrowBack from '@assets/images/icons/arrow-back.svg';
import ArrowDown from '@assets/images/icons/arrow-down.svg';
import ArrowForward from '@assets/images/icons/arrow-forward.svg';
import ArrowLeft from '@assets/images/icons/arrow-left.svg';
import ArrowRight from '@assets/images/icons/arrow-right.svg';
import ArrowUp from '@assets/images/icons/arrow-up.svg';
import Clock from '@assets/images/icons/clock.svg';
import Close from '@assets/images/icons/close.svg';
import DewPoint from '@assets/images/icons/dew-point.svg';
import FeelsLikeColder from '@assets/images/icons/feels-like-colder.svg';
import FeelsLikeWarmer from '@assets/images/icons/feels-like-warmer.svg';
import FeelsLike from '@assets/images/icons/feels-like.svg';
import Gust from '@assets/images/icons/gust.svg';
import InfoDeleteLocationDark from '@assets/images/icons/info-delete-location-dark.svg';
import InfoLocateDark from '@assets/images/icons/info-locate-dark.svg';
import InfoSaveLocationDark from '@assets/images/icons/info-save-location-dark.svg';
import InfoDeleteLocationLight from '@assets/images/icons/info-delete-location-light.svg';
import InfoLocateLight from '@assets/images/icons/info-locate-light.svg';
import InfoSaveLocationLight from '@assets/images/icons/info-save-location-light.svg';
import Info from '@assets/images/icons/info.svg';
import Layers from '@assets/images/icons/layers.svg';
import Locate from '@assets/images/icons/locate.svg';
import LogoFmiEn from '@assets/images/icons/logo-fmi-en.svg';
import LogoFmiFi from '@assets/images/icons/logo-fmi-fi.svg';
import LogoFmiSv from '@assets/images/icons/logo-fmi-sv.svg';
import MapMarker from '@assets/images/icons/map-marker.svg';
import Map from '@assets/images/icons/map.svg';
import Menu from '@assets/images/icons/menu.svg';
import Mic from '@assets/images/icons/mic.svg';
import MidnightSun from '@assets/images/icons/midnight-sun.svg';
import Minus from '@assets/images/icons/minus.svg';
import OpenInNew from '@assets/images/icons/open-in-new.svg';
import Pause from '@assets/images/icons/pause.svg';
import Play from '@assets/images/icons/play.svg';
import Plus from '@assets/images/icons/plus.svg';
import PolarNight from '@assets/images/icons/polar-night.svg';
import Precipitation from '@assets/images/icons/precipitation.svg';
import RadioButtonOff from '@assets/images/icons/radio-button-off.svg';
import RadioButtonOn from '@assets/images/icons/radio-button-on.svg';
import RainDark from '@assets/images/icons/rain-dark.svg';
import RainLight from '@assets/images/icons/rain-light.svg';
import RainWhite from '@assets/images/icons/rain-white.svg';
import Search from '@assets/images/icons/search.svg';
import Settings from '@assets/images/icons/settings.svg';
import Snow from '@assets/images/icons/snow.svg';
import SocialInstagramDark from '@assets/images/icons/social-instagram-dark.svg';
import SocialTwitterDark from '@assets/images/icons/social-twitter-dark.svg';
import SocialYoutubeDark from '@assets/images/icons/social-youtube-dark.svg';
import SocialInstagramLight from '@assets/images/icons/social-instagram-light.svg';
import SocialTwitterLight from '@assets/images/icons/social-twitter-light.svg';
import SocialYoutubeLight from '@assets/images/icons/social-youtube-light.svg';
import StarSelected from '@assets/images/icons/star-selected.svg';
import StarUnselected from '@assets/images/icons/star-unselected.svg';
import SunArrowDown from '@assets/images/icons/sun-arrow-down.svg';
import SunArrowUp from '@assets/images/icons/sun-arrow-up.svg';
import Sun from '@assets/images/icons/sun.svg';
import Sunrise from '@assets/images/icons/sunrise.svg';
import Sunset from '@assets/images/icons/sunset.svg';
import TemperatureDark from '@assets/images/icons/temperature-dark.svg';
import TemperatureLight from '@assets/images/icons/temperature-light.svg';
import TemperatureHighestDark from '@assets/images/icons/temperature-highest-dark.svg';
import TemperatureHighestLight from '@assets/images/icons/temperature-highest-light.svg';
import TemperatureLowestDark from '@assets/images/icons/temperature-lowest-dark.svg';
import TemperatureLowestLight from '@assets/images/icons/temperature-lowest-light.svg';
import Temperature from '@assets/images/icons/temperature.svg';
import Thunder from '@assets/images/icons/thunder.svg';
import Time from '@assets/images/icons/time.svg';
import WarningsFloodingYellow from '@assets/images/icons/warnings-flooding-yellow.svg';
import WarningsFloodingOrange from '@assets/images/icons/warnings-flooding-orange.svg';
import WarningsFloodingRed from '@assets/images/icons/warnings-flooding-red.svg';
import WarningsForestFireWeatherOrange from '@assets/images/icons/warnings-forest-fire-weather-orange.svg';
import WarningsForestFireWeatherRed from '@assets/images/icons/warnings-forest-fire-weather-red.svg';
import WarningsForestFireWeatherYellow from '@assets/images/icons/warnings-forest-fire-weather-yellow.svg';
import WarningsGrassFireWeather from '@assets/images/icons/warnings-grass-fire-weather.svg';
import WarningsHotWeatherOrange from '@assets/images/icons/warnings-hot-weather-orange.svg';
import WarningsHotWeatherRed from '@assets/images/icons/warnings-hot-weather-red.svg';
import WarningsHotWeatherYellow from '@assets/images/icons/warnings-hot-weather-yellow.svg';
import WarningsPedestrianSafety from '@assets/images/icons/warnings-pedestrian-safety.svg';
import WarningsRainOrange from '@assets/images/icons/warnings-rain-orange.svg';
import WarningsRainRed from '@assets/images/icons/warnings-rain-red.svg';
import WarningsRainYellow from '@assets/images/icons/warnings-rain-yellow.svg';
import WarningsStatusOrange from '@assets/images/icons/warnings-status-orange.svg';
import WarningsThunderStormOrange from '@assets/images/icons/warnings-thunder-storm-orange.svg';
import WarningsThunderStormRed from '@assets/images/icons/warnings-thunder-storm-red.svg';
import WarningsThunderStormYellow from '@assets/images/icons/warnings-thunder-storm-yellow.svg';
import WarningsTrafficWeatherOrange from '@assets/images/icons/warnings-traffic-weather-orange.svg';
import WarningsTrafficWeatherYellow from '@assets/images/icons/warnings-traffic-weather-yellow.svg';
import WarningsUvNote from '@assets/images/icons/warnings-uv-note.svg';
import WarningsWindOrange from '@assets/images/icons/warnings-wind-orange.svg';
import WarningsWindRed from '@assets/images/icons/warnings-wind-red.svg';
import WarningsWindYellow from '@assets/images/icons/warnings-wind-yellow.svg';
import Warnings from '@assets/images/icons/warnings.svg';
import WeatherSymbol from '@assets/images/icons/weather-symbol.svg';
import Weather from '@assets/images/icons/weather.svg';
import WindArrow from '@assets/images/icons/wind-arrow.svg';
import WindDark from '@assets/images/icons/wind-dark.svg';
import WindLight from '@assets/images/icons/wind-light.svg';
import WindLightMap from '@assets/images/icons/wind-light-map.svg';
import WindNextHour from '@assets/images/icons/wind-next-hour.svg';
import Wind from '@assets/images/icons/wind.svg';

// FeelsLike Icons
import FeelsLikeBasic from '@assets/images/feelslike/basic.svg';
import FeelsLikeEaster from '@assets/images/feelslike/easter.svg';
import FeelsLikeHalloween from '@assets/images/feelslike/halloween.svg';
import FeelsLikeHot from '@assets/images/feelslike/hot.svg';
import FeelsLikeItsenaisyyspaiva from '@assets/images/feelslike/itsenaisyyspaiva.svg';
import FeelsLikeJuhannus from '@assets/images/feelslike/juhannus.svg';
import FeelsLikeNaistenpaiva from '@assets/images/feelslike/naistenpaiva.svg';
import FeelsLikeNewYear from '@assets/images/feelslike/newyear.svg';
import FeelsLikeRaining from '@assets/images/feelslike/raining.svg';
import FeelsLikeValentine from '@assets/images/feelslike/valentine.svg';
import FeelsLikeVappu from '@assets/images/feelslike/vappu.svg';
import FeelsLikeWindy from '@assets/images/feelslike/windy.svg';
import FeelsLikeWinter from '@assets/images/feelslike/winter.svg';
import FeelsLikeXmas from '@assets/images/feelslike/xmas.svg';

import { SvgProps } from 'react-native-svg';

type CustomIconProps = IconProps & {
  name: string;
  width?: number;
  height?: number;
  size?: number;
  style?: StyleProp<ViewStyle & TextStyle>;
};

const Icon: React.FC<CustomIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'arrow-back':
      return <ArrowBack {...(props as SvgProps)} />;
    case 'arrow-down':
      return <ArrowDown {...(props as SvgProps)} />;
    case 'arrow-forward':
      return <ArrowForward {...(props as SvgProps)} />;
    case 'arrow-left':
      return <ArrowLeft {...(props as SvgProps)} />;
    case 'arrow-right':
      return <ArrowRight {...(props as SvgProps)} />;
    case 'arrow-up':
      return <ArrowUp {...(props as SvgProps)} />;
    case 'clock':
      return <Clock {...(props as SvgProps)} />;
    case 'close':
      return <Close {...(props as SvgProps)} />;
    case 'dew-point':
      return <DewPoint {...(props as SvgProps)} />;
    case 'feels-like-colder':
      return <FeelsLikeColder {...(props as SvgProps)} />;
    case 'feels-like-warmer':
      return <FeelsLikeWarmer {...(props as SvgProps)} />;
    case 'feels-like':
      return <FeelsLike {...(props as SvgProps)} />;
    case 'gust':
      return <Gust {...(props as SvgProps)} />;
    case 'info-delete-location-dark':
      return <InfoDeleteLocationDark {...(props as SvgProps)} />;
    case 'info-locate-dark':
      return <InfoLocateDark {...(props as SvgProps)} />;
    case 'info-save-location-dark':
      return <InfoSaveLocationDark {...(props as SvgProps)} />;
    case 'info-delete-location-light':
      return <InfoDeleteLocationLight {...(props as SvgProps)} />;
    case 'info-locate-light':
      return <InfoLocateLight {...(props as SvgProps)} />;
    case 'info-save-location-light':
      return <InfoSaveLocationLight {...(props as SvgProps)} />;
    case 'info':
      return <Info {...(props as SvgProps)} />;
    case 'layers':
      return <Layers {...(props as SvgProps)} />;
    case 'locate':
      return <Locate {...(props as SvgProps)} />;
    case 'logo-fmi-en':
      return <LogoFmiEn {...(props as SvgProps)} />;
    case 'logo-fmi-fi':
      return <LogoFmiFi {...(props as SvgProps)} />;
    case 'logo-fmi-sv':
      return <LogoFmiSv {...(props as SvgProps)} />;
    case 'map-marker':
      return <MapMarker {...(props as SvgProps)} />;
    case 'map':
      return <Map {...(props as SvgProps)} />;
    case 'menu':
      return <Menu {...(props as SvgProps)} />;
    case 'mic':
      return <Mic {...(props as SvgProps)} />;
    case 'midnight-sun':
      return <MidnightSun {...(props as SvgProps)} />;
    case 'minus':
      return <Minus {...(props as SvgProps)} />;
    case 'open-in-new':
      return <OpenInNew {...(props as SvgProps)} />;
    case 'pause':
      return <Pause {...(props as SvgProps)} />;
    case 'play':
      return <Play {...(props as SvgProps)} />;
    case 'plus':
      return <Plus {...(props as SvgProps)} />;
    case 'polar-night':
      return <PolarNight {...(props as SvgProps)} />;
    case 'precipitation':
      return <Precipitation {...(props as SvgProps)} />;
    case 'radio-button-off':
      return <RadioButtonOff {...(props as SvgProps)} />;
    case 'radio-button-on':
      return <RadioButtonOn {...(props as SvgProps)} />;
    case 'rain-dark':
      return <RainDark {...(props as SvgProps)} />;
    case 'rain-light':
      return <RainLight {...(props as SvgProps)} />;
    case 'rain-white':
      return <RainWhite {...(props as SvgProps)} />;
    case 'search':
      return <Search {...(props as SvgProps)} />;
    case 'settings':
      return <Settings {...(props as SvgProps)} />;
    case 'snow':
      return <Snow {...(props as SvgProps)} />;
    case 'social-instagram-dark':
      return <SocialInstagramDark {...(props as SvgProps)} />;
    case 'social-twitter-dark':
      return <SocialTwitterDark {...(props as SvgProps)} />;
    case 'social-youtube-dark':
      return <SocialYoutubeDark {...(props as SvgProps)} />;
    case 'social-instagram-light':
      return <SocialInstagramLight {...(props as SvgProps)} />;
    case 'social-twitter-light':
      return <SocialTwitterLight {...(props as SvgProps)} />;
    case 'social-youtube-light':
      return <SocialYoutubeLight {...(props as SvgProps)} />;
    case 'star-selected':
      return <StarSelected {...(props as SvgProps)} />;
    case 'star-unselected':
      return <StarUnselected {...(props as SvgProps)} />;
    case 'sun-arrow-down':
      return <SunArrowDown {...(props as SvgProps)} />;
    case 'sun-arrow-up':
      return <SunArrowUp {...(props as SvgProps)} />;
    case 'sun':
      return <Sun {...(props as SvgProps)} />;
    case 'sunrise':
      return <Sunrise {...(props as SvgProps)} />;
    case 'sunset':
      return <Sunset {...(props as SvgProps)} />;
    case 'temperature-dark':
      return <TemperatureDark {...(props as SvgProps)} />;
    case 'temperature-light':
      return <TemperatureLight {...(props as SvgProps)} />;
    case 'temperature-highest-dark':
      return <TemperatureHighestDark {...(props as SvgProps)} />;
    case 'temperature-highest-light':
      return <TemperatureHighestLight {...(props as SvgProps)} />;
    case 'temperature-lowest-dark':
      return <TemperatureLowestDark {...(props as SvgProps)} />;
    case 'temperature-lowest-light':
      return <TemperatureLowestLight {...(props as SvgProps)} />;
    case 'temperature':
      return <Temperature {...(props as SvgProps)} />;
    case 'thunder':
      return <Thunder {...(props as SvgProps)} />;
    case 'time':
      return <Time {...(props as SvgProps)} />;
    case 'warnings-flooding-yellow':
      return <WarningsFloodingYellow {...(props as SvgProps)} />;
    case 'warnings-flooding-orange':
      return <WarningsFloodingOrange {...(props as SvgProps)} />;
    case 'warnings-flooding-red':
      return <WarningsFloodingRed {...(props as SvgProps)} />;
    case 'warnings-forest-fire-weather-orange':
      return <WarningsForestFireWeatherOrange {...(props as SvgProps)} />;
    case 'warnings-forest-fire-weather-red':
      return <WarningsForestFireWeatherRed {...(props as SvgProps)} />;
    case 'warnings-forest-fire-weather-yellow':
      return <WarningsForestFireWeatherYellow {...(props as SvgProps)} />;
    case 'warnings-grass-fire-weather':
      return <WarningsGrassFireWeather {...(props as SvgProps)} />;
    case 'warnings-hot-weather-orange':
    case 'warnings-cold-weather-orange':
      return <WarningsHotWeatherOrange {...(props as SvgProps)} />;
    case 'warnings-hot-weather-red':
    case 'warnings-cold-weather-red':
      return <WarningsHotWeatherRed {...(props as SvgProps)} />;
    case 'warnings-hot-weather-yellow':
    case 'warnings-cold-weather-yellow':
      return <WarningsHotWeatherYellow {...(props as SvgProps)} />;
    case 'warnings-pedestrian-safety':
      return <WarningsPedestrianSafety {...(props as SvgProps)} />;
    case 'warnings-rain-orange':
      return <WarningsRainOrange {...(props as SvgProps)} />;
    case 'warnings-rain-red':
      return <WarningsRainRed {...(props as SvgProps)} />;
    case 'warnings-rain-yellow':
      return <WarningsRainYellow {...(props as SvgProps)} />;
    case 'warnings-status-orange':
      return <WarningsStatusOrange {...(props as SvgProps)} />;
    case 'warnings-thunder-storm-orange':
      return <WarningsThunderStormOrange {...(props as SvgProps)} />;
    case 'warnings-thunder-storm-red':
      return <WarningsThunderStormRed {...(props as SvgProps)} />;
    case 'warnings-thunder-storm-yellow':
      return <WarningsThunderStormYellow {...(props as SvgProps)} />;
    case 'warnings-traffic-weather-orange':
      return <WarningsTrafficWeatherOrange {...(props as SvgProps)} />;
    case 'warnings-traffic-weather-yellow':
      return <WarningsTrafficWeatherYellow {...(props as SvgProps)} />;
    case 'warnings-uv-note':
      return <WarningsUvNote {...(props as SvgProps)} />;
    case 'warnings-wind-orange':
      return <WarningsWindOrange {...(props as SvgProps)} />;
    case 'warnings-wind-red':
      return <WarningsWindRed {...(props as SvgProps)} />;
    case 'warnings-wind-yellow':
      return <WarningsWindYellow {...(props as SvgProps)} />;
    case 'warnings':
      return <Warnings {...(props as SvgProps)} />;
    case 'weather-symbol':
      return <WeatherSymbol {...(props as SvgProps)} />;
    case 'weather':
      return <Weather {...(props as SvgProps)} />;
    case 'wind-arrow':
      return <WindArrow {...(props as SvgProps)} />;
    case 'wind-dark':
      return <WindDark {...(props as SvgProps)} />;
    case 'wind-light':
      return <WindLight {...(props as SvgProps)} />;
    case 'wind-light-map':
      return <WindLightMap {...(props as SvgProps)} />;
    case 'wind-next-hour':
      return <WindNextHour {...(props as SvgProps)} />;
    case 'wind':
      return <Wind {...(props as SvgProps)} />;
    case 'feels-like-basic':
      return <FeelsLikeBasic {...(props as SvgProps)} />;
    case 'feels-like-easter':
      return <FeelsLikeEaster {...(props as SvgProps)} />;
    case 'feels-like-halloween':
      return <FeelsLikeHalloween {...(props as SvgProps)} />;
    case 'feels-like-hot':
      return <FeelsLikeHot {...(props as SvgProps)} />;
    case 'feels-like-itsenaisyyspaiva':
      return <FeelsLikeItsenaisyyspaiva {...(props as SvgProps)} />;
    case 'feels-like-juhannus':
      return <FeelsLikeJuhannus {...(props as SvgProps)} />;
    case 'feels-like-naistenpaiva':
      return <FeelsLikeNaistenpaiva {...(props as SvgProps)} />;
    case 'feels-like-newyear':
      return <FeelsLikeNewYear {...(props as SvgProps)} />;
    case 'feels-like-raining':
      return <FeelsLikeRaining {...(props as SvgProps)} />;
    case 'feels-like-valentine':
      return <FeelsLikeValentine {...(props as SvgProps)} />;
    case 'feels-like-vappu':
      return <FeelsLikeVappu {...(props as SvgProps)} />;
    case 'feels-like-windy':
      return <FeelsLikeWindy {...(props as SvgProps)} />;
    case 'feels-like-winter':
      return <FeelsLikeWinter {...(props as SvgProps)} />;
    case 'feels-like-xmas':
      return <FeelsLikeXmas {...(props as SvgProps)} />;
    default:
      return <IonIcon name={name} {...props} />;
  }
};

export default Icon;

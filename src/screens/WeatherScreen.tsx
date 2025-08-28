import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, ScrollView, StyleSheet, Platform, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectAnnouncements } from '@store/announcements/selectors';

import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';
import { resetObservations as resetObservationsAction } from '@store/observation/actions';
import { fetchWarnings as fetchWarningsAction } from '@store/warnings/actions';
import { fetchMeteorologistSnapshot as fetchMeteorologistSnapshotAction } from '@store/meteorologist/actions';
import { fetchNews as fetchNewsAction } from '@store/news/actions';

import GradientWrapper from '@components/weather/GradientWrapper';
import NextHourForecastPanel from '@components/weather/NextHourForecastPanel';
import NextHourForecastPanelWithWeatherBackground from '@components/weather/NextHourForecastPanelWithWeatherBackground';
import ForecastPanel from '@components/weather/ForecastPanel';
import ForecastPanelWithVerticalLayout from '@components/weather/ForecastPanelWithVerticalLayout';
import ObservationPanel from '@components/weather/ObservationPanel';
import SunAndMoonPanel from '@components/weather/SunAndMoonPanel';
import News from '@components/news/News';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import Announcements from '@components/announcements/Announcements';
import WarningIconsPanel from '@components/warnings/WarningIconsPanel';
import MeteorologistSnapshot from '@components/weather/MeteorologistSnapshot';
import { useTranslation } from 'react-i18next';

const mapStateToProps = (state: State) => ({
  announcements: selectAnnouncements(state),
  location: selectCurrent(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
  fetchObservation: fetchObservationAction,
  fetchWarnings: fetchWarningsAction,
  fetchMeteorologistSnapshot: fetchMeteorologistSnapshotAction,
  fetchNews: fetchNewsAction,
  resetObservations: resetObservationsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  fetchForecast,
  fetchObservation,
  fetchWarnings,
  fetchMeteorologistSnapshot,
  fetchNews,
  resetObservations,
  location,
  announcements,
}) => {
  const { i18n } = useTranslation();
  const isFocused = useIsFocused();
  const { width} = useWindowDimensions();
  const [forecastUpdated, setForecastUpdated] = useState<number>(Date.now());
  const [observationUpdated, setObservationUpdated] = useState<number>(0);
  const [warningsUpdated, setWarningsUpdated] = useState<number>(Date.now());
  const [meteorologistUpdated, setMeteorologistUpdated] = useState<number>(Date.now());
  const [newsUpdated, setNewsUpdated] = useState<number>(Date.now());
  const [observationVisible, setObservationVisible] = useState(false);
  const observationRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { shouldReload } = useReloader();

  const { weather: weatherConfig, warnings: warningsConfig, news: newsConfig } = Config.getAll();
  const showMeteorologistSnapshot = weatherConfig.meteorologist?.url &&
                                    location.country === 'FI' &&
                                    i18n.language === 'fi';
  const showLocalWarnings = warningsConfig.enabled &&
                            Object.keys(warningsConfig.apiUrl).includes(location.country);
  const isWideDisplay = () => width > 700;

  const updateForecast = useCallback(() => {
    const geoid = location.id;
    const forecastLocation = {
      geoid,
      latlon: `${location.lat},${location.lon}`
    }

    fetchForecast(forecastLocation, geoid ? [geoid] : [], location.country);
    setForecastUpdated(Date.now());
  }, [
    fetchForecast,
    location.id,
    location.lat,
    location.lon,
    location.country,
    setForecastUpdated,
  ]);

  const updateObservation = useCallback(() => {
    console.log('Updating observations');

    if (weatherConfig.observation.enabled) {
      const observationLocation = {
        geoid: location.id,
        latlon: `${location.lat},${location.lon}`
      }

      fetchObservation(observationLocation, location.country);
      setObservationUpdated(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchObservation,
    location.id,
    location.lat,
    location.lon,
    weatherConfig.observation.enabled,
  ]);

  const updateWarnings = useCallback(() => {
    if (warningsConfig.enabled && warningsConfig.apiUrl[location.country]) {
      fetchWarnings(location);
      setWarningsUpdated(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWarnings, location.lat, location.lon, warningsConfig]);

  const updateMeteorologistSnapshot = useCallback(() => {
    if (showMeteorologistSnapshot) {
      fetchMeteorologistSnapshot();
      setMeteorologistUpdated(Date.now());
    }
  }, [showMeteorologistSnapshot, fetchMeteorologistSnapshot]);

  const updateNews = useCallback(() => {
    if (newsConfig.enabled) {
      fetchNews(i18n.language);
      setNewsUpdated(Date.now());
    }
  }, [fetchNews, i18n.language, newsConfig.enabled]);

  useEffect(() => {
    const now = Date.now();
    const observationUpdateTime =
      observationUpdated +
      (weatherConfig.observation.updateInterval ?? 5) * 60 * 1000;
    const forecastUpdateTime =
      forecastUpdated +
      (weatherConfig.forecast.updateInterval ?? 5) * 60 * 1000;
    const meteorologistUpdateTime = meteorologistUpdated +
      (weatherConfig.meteorologist?.updateInterval ?? 10) * 60 * 1000;
    const warningsUpdateTime =
      warningsUpdated + (warningsConfig.updateInterval ?? 5) * 60 * 1000;
    const newsUpdateTime =
      newsUpdated + (newsConfig.updateInterval ?? 30) * 60 * 1000;

    const lazyLoadObservations = weatherConfig.layout === 'fmi'
                                  && (weatherConfig.observation.lazyLoad === true
                                    || weatherConfig.observation.lazyLoad === undefined);

    if (isFocused) {
      if (now > forecastUpdateTime || shouldReload > forecastUpdateTime) {
        updateForecast();
      }
      if ((!lazyLoadObservations || observationVisible) &&
        (now > observationUpdateTime || shouldReload > observationUpdateTime)) {
        updateObservation();
      }
      if (now > warningsUpdateTime || shouldReload > warningsUpdateTime) {
        updateWarnings();
      }
      if (now > meteorologistUpdateTime || shouldReload > meteorologistUpdateTime) {
        updateMeteorologistSnapshot();
      }
      if (now > newsUpdateTime || shouldReload > newsUpdateTime) {
        updateNews();
      }
    }
  }, [isFocused, forecastUpdated, observationUpdated, warningsUpdated, meteorologistUpdated,
    shouldReload, weatherConfig, warningsConfig, updateForecast, updateObservation, updateWarnings,
    updateMeteorologistSnapshot, newsUpdated, newsConfig.updateInterval, updateNews, observationVisible]);

  useEffect(() => {
    setObservationUpdated(0);
    resetObservations();
    updateForecast();
    updateWarnings();
    updateMeteorologistSnapshot();
    updateNews();
  }, [location, updateForecast, updateObservation, updateWarnings, updateMeteorologistSnapshot,
     updateNews, resetObservations]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const viewportHeight = e.nativeEvent.layoutMeasurement.height;

    //@ts-ignore
    scrollViewRef.current?.measure((_sx, _sy, _sw, _svH, _spx, svPageY) => {
      observationRef.current?.measure((_x, _y, _w, targetH, _px, targetPageY) => {
        const elementTopInViewport = targetPageY - svPageY;
        const elementBottomInViewport = elementTopInViewport + targetH;
        const visible = elementBottomInViewport > 0 && elementTopInViewport < viewportHeight;
        setObservationVisible(visible);
      });
    });
  };

  const currentHour = new Date().getHours();

  return weatherConfig.layout === 'fmi' ? (
      <View testID="weather_view">
        <ScrollView
          testID="weather_scrollview"
          ref={scrollViewRef}
          onScroll={handleScroll}
          style={[styles.container]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={announcements && [0]}>
          <Announcements style={styles.announcements} />
          <NextHourForecastPanelWithWeatherBackground currentHour={currentHour} />
          <ForecastPanelWithVerticalLayout currentHour={currentHour}/>
          {isWideDisplay() && showLocalWarnings && showMeteorologistSnapshot ? (
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <WarningIconsPanel gridLayout />
              </View>
              <View style={styles.gridItem}>
                <MeteorologistSnapshot gridLayout />
              </View>
            </View>
          ) :
            <>
              { showLocalWarnings && <WarningIconsPanel /> }
              { showMeteorologistSnapshot && <MeteorologistSnapshot /> }
            </>
          }
          <SunAndMoonPanel />
          <View ref={observationRef} collapsable={false}>
            <ObservationPanel />
          </View>
          <News />
        </ScrollView>
      </View>
    ) : (
    <GradientWrapper>
      <View testID="weather_view">
        <ScrollView
          testID="weather_scrollview"
          style={[styles.container]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={announcements && [0]}>
          <Announcements style={styles.announcements} />
          <NextHourForecastPanel currentHour={currentHour} />
          <ForecastPanel currentHour={currentHour}/>
          <ObservationPanel />
        </ScrollView>
      </View>
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  },
  contentContainer: {
    ...Platform.select({
      android: {
        paddingBottom: 28,
      },
    }),
  },
  announcements: {
    elevation: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default connector(WeatherScreen);

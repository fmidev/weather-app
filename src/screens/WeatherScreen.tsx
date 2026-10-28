import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  type ViewInstance,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Platform,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent, selectFavorites } from '@store/location/selector';
import { setCurrentLocation as setCurrentLocationAction } from '@store/location/actions';
import type { Location } from '@store/location/types';
import { selectAnnouncements } from '@store/announcements/selectors';

import {
  fetchAllForecasts as fetchAllForecastsAction,
  fetchForecast as fetchForecastAction,
} from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';
import { resetObservations as resetObservationsAction } from '@store/observation/actions';
import {
  fetchWarnings as fetchWarningsAction,
  fetchFavoriteWarnings as fetchFavoriteWarningsAction,
} from '@store/warnings/actions';
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
import FavoritesPanel from '@components/weather/FavoritesPanel';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import Announcements from '@components/announcements/Announcements';
import WarningIconsPanel from '@components/warnings/WarningIconsPanel';
import MeteorologistSnapshot from '@components/weather/MeteorologistSnapshot';
import { useTranslation } from 'react-i18next';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  announcements: selectAnnouncements(state),
  location: selectCurrent(state),
  favorites: selectFavorites(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
  fetchAllForecasts: fetchAllForecastsAction,
  fetchObservation: fetchObservationAction,
  fetchWarnings: fetchWarningsAction,
  fetchFavoriteWarnings: fetchFavoriteWarningsAction,
  fetchMeteorologistSnapshot: fetchMeteorologistSnapshotAction,
  fetchNews: fetchNewsAction,
  resetObservations: resetObservationsAction,
  setCurrentLocation: setCurrentLocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  fetchForecast,
  fetchAllForecasts,
  fetchObservation,
  fetchWarnings,
  fetchFavoriteWarnings,
  fetchMeteorologistSnapshot,
  fetchNews,
  resetObservations,
  setCurrentLocation,
  location,
  favorites,
  announcements,
}) => {
  const { i18n } = useTranslation();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const [forecastUpdated, setForecastUpdated] = useState<number>(Date.now());
  const [observationUpdated, setObservationUpdated] = useState<number>(0);
  const [warningsUpdated, setWarningsUpdated] = useState<number>(Date.now());
  const [meteorologistUpdated, setMeteorologistUpdated] = useState<number>(
    Date.now()
  );
  const [newsUpdated, setNewsUpdated] = useState<number>(Date.now());
  const [observationVisible, setObservationVisible] = useState(false);
  const observationRef = useRef<ViewInstance>(null);
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const { shouldReload } = useReloader();

  const {
    weather: weatherConfig,
    warnings: warningsConfig,
    news: newsConfig,
  } = Config.getAll();
  const showMeteorologistSnapshot =
    weatherConfig.meteorologist?.url &&
    location.country === 'FI' &&
    i18n.language === 'fi';
  const showLocalWarnings =
    warningsConfig.enabled &&
    Object.keys(warningsConfig.apiUrl).includes(location.country);
  const isWideDisplay = () => width > 700;

  const selectFavoriteLocation = useCallback(
    (favorite: Location, scrollToTop = true) => {
      trackMatomoEvent(
        'User action',
        'Weather',
        'Select location - favourites'
      );
      setCurrentLocation({ ...favorite });
      if (scrollToTop) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    },
    [setCurrentLocation]
  );

  const updateForecasts = useCallback(() => {
    if (weatherConfig.favoritesPanelEnabled === false) {
      fetchForecast(
        { geoid: location.id, latlon: `${location.lat},${location.lon}` },
        location.country
      );
    } else {
      const locationIds = new Set<string>();
      const locations = [location, ...favorites].filter(({ id }) => {
        const key = String(id);
        if (locationIds.has(key)) return false;

        locationIds.add(key);
        return true;
      });
      fetchAllForecasts(locations);
    }
    setForecastUpdated(Date.now());
  }, [
    fetchForecast,
    fetchAllForecasts,
    favorites,
    location,
    weatherConfig.favoritesPanelEnabled,
    setForecastUpdated,
  ]);

  const updateObservation = useCallback(() => {
    if (weatherConfig.observation.enabled) {
      const observationLocation = {
        geoid: location.id,
        latlon: `${location.lat},${location.lon}`,
      };

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
    if (!warningsConfig.enabled) return;

    if (warningsConfig.apiUrl[location.country]) {
      fetchWarnings(location);
    }
    if (weatherConfig.favoritesPanelEnabled !== false) {
      fetchFavoriteWarnings(
        favorites.filter(({ id }) => String(id) !== String(location.id))
      );
    }
    setWarningsUpdated(Date.now());
  }, [
    fetchWarnings,
    fetchFavoriteWarnings,
    favorites,
    location,
    warningsConfig,
    weatherConfig.favoritesPanelEnabled,
  ]);

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
    const meteorologistUpdateTime =
      meteorologistUpdated +
      (weatherConfig.meteorologist?.updateInterval ?? 10) * 60 * 1000;
    const warningsUpdateTime =
      warningsUpdated + (warningsConfig.updateInterval ?? 5) * 60 * 1000;
    const newsUpdateTime =
      newsUpdated + (newsConfig.updateInterval ?? 30) * 60 * 1000;

    const lazyLoadObservations =
      weatherConfig.layout === 'vertical' &&
      (weatherConfig.observation.lazyLoad === true ||
        weatherConfig.observation.lazyLoad === undefined);

    if (isFocused) {
      if (now > forecastUpdateTime || shouldReload > forecastUpdateTime) {
        updateForecasts();
      }
      if (
        (!lazyLoadObservations || observationVisible) &&
        (now > observationUpdateTime || shouldReload > observationUpdateTime)
      ) {
        updateObservation();
      }
      if (now > warningsUpdateTime || shouldReload > warningsUpdateTime) {
        updateWarnings();
      }
      if (
        now > meteorologistUpdateTime ||
        shouldReload > meteorologistUpdateTime
      ) {
        updateMeteorologistSnapshot();
      }
      if (now > newsUpdateTime || shouldReload > newsUpdateTime) {
        updateNews();
      }
    }
  }, [
    isFocused,
    forecastUpdated,
    observationUpdated,
    warningsUpdated,
    meteorologistUpdated,
    shouldReload,
    weatherConfig,
    warningsConfig,
    updateForecasts,
    updateObservation,
    updateWarnings,
    updateMeteorologistSnapshot,
    newsUpdated,
    newsConfig.updateInterval,
    updateNews,
    observationVisible,
  ]);

  useEffect(() => {
    setObservationUpdated(0);
    resetObservations();
    updateForecasts();
    updateWarnings();
    updateMeteorologistSnapshot();
    updateNews();
  }, [
    location,
    updateForecasts,
    updateObservation,
    updateWarnings,
    updateMeteorologistSnapshot,
    updateNews,
    resetObservations,
  ]);

  const updateObservationVisibility = (viewportHeight?: number) => {
    scrollViewRef.current
      ?.getNativeScrollRef()
      ?.measure((_sx, _sy, _sw, measuredHeight, _spx, svPageY) => {
        const height = viewportHeight ?? measuredHeight;
        observationRef.current?.measure(
          (_x, _y, _w, targetH, _px, targetPageY) => {
            const elementTopInViewport = targetPageY - svPageY;
            const elementBottomInViewport = elementTopInViewport + targetH;
            const visible =
              elementBottomInViewport > 0 && elementTopInViewport < height;
            setObservationVisible(visible);
          }
        );
      });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateObservationVisibility(e.nativeEvent.layoutMeasurement.height);
  };

  const currentHour = new Date().getHours();

  return weatherConfig.layout === 'vertical' ? (
    <View testID="weather_view">
      <ScrollView
        testID="weather_scrollview"
        ref={scrollViewRef}
        onScroll={handleScroll}
        onLayout={() => updateObservationVisibility()}
        onContentSizeChange={() => updateObservationVisibility()}
        style={[styles.container]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={announcements && [0]}>
        <Announcements style={styles.announcements} />
        <NextHourForecastPanelWithWeatherBackground currentHour={currentHour} />

        {weatherConfig.favoritesPanelEnabled !== false && (
          <FavoritesPanel onSelectLocation={selectFavoriteLocation} />
        )}

        <ForecastPanelWithVerticalLayout currentHour={currentHour} />

        {isWideDisplay() && showLocalWarnings && showMeteorologistSnapshot ? (
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <WarningIconsPanel gridLayout />
            </View>
            <View style={styles.gridItem}>
              <MeteorologistSnapshot gridLayout />
            </View>
          </View>
        ) : (
          <>
            {showLocalWarnings && <WarningIconsPanel />}
            {showMeteorologistSnapshot && <MeteorologistSnapshot />}
          </>
        )}
        <SunAndMoonPanel />
        <View
          ref={observationRef}
          collapsable={false}
          testID="observation-panel-container">
          <ObservationPanel />
        </View>
        <News />
      </ScrollView>
    </View>
  ) : (
    <GradientWrapper>
      <View
        testID="weather_view"
        style={
          Platform.OS === 'android' &&
          weatherConfig.layout !== 'legacyWithoutBackgroundColor'
            ? styles.legacyAndroid
            : null
        }>
        <ScrollView
          testID="weather_scrollview"
          style={[styles.container]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={announcements && [0]}>
          <Announcements style={styles.announcements} />
          <NextHourForecastPanel currentHour={currentHour} />
          <ForecastPanel currentHour={currentHour} />
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
  legacyAndroid: {
    marginBottom: 70,
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

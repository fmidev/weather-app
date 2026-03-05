import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import Map, { Polygon } from 'react-native-maps';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';

import { Config } from '@config';
import { useTheme } from '@react-navigation/native';
import { CapWarning, Severity } from '@store/warnings/types';
import {
  CAP_WARNING_ORANGE,
  CAP_WARNING_RED,
  CAP_WARNING_YELLOW,
  CustomTheme,
  GRAY_8,
} from '@assets/colors';
import darkMapStyle from '@utils/dark_map_style.json';
import { getSeveritiesForDays } from '@utils/helpers';
import DaySelectorList from './DaySelectorList';
import WarningTypeFiltersList from './WarningTypeFiltersList';
import { selectLoading } from '@store/warnings/selectors';
import type { State } from '@store/types';

const SEVERITY_COLORS: { [key: string]: string } = {
  Extreme: CAP_WARNING_RED,
  Severe: CAP_WARNING_ORANGE,
  Moderate: CAP_WARNING_YELLOW,
};

const SEVERITIES: Severity[] = ['Moderate', 'Severe', 'Extreme'];

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapViewProps = PropsFromRedux & {
  dates: { time: number; weekday: string; date: string }[];
  capData?: CapWarning[];
};

const MapView: React.FC<MapViewProps> = ({
  loading,
  dates,
  capData,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedFilters, setSelectedFilters] = useState<
    { severity: Severity; event: string }[]
  >([]);

  const date = useMemo(
    () => moment(dates[selectedDay].time),
    [selectedDay, dates]
  );

  const applicableWarnings = useMemo(() => {
    const dayStart = date.hours(0).minutes(0);
    const dayEnd = date.clone().add(1, 'days');
    const warnings = capData?.filter((warning) => {
      const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
      const effectiveMoment = moment(info.effective);
      const expiryMoment = moment(info.expires);

      const endsDuringDay =
        effectiveMoment.isBefore(dayStart) && expiryMoment.isAfter(dayStart);
      const isContainedInDay =
        effectiveMoment.isAfter(dayStart) && expiryMoment.isBefore(dayEnd);
      const startsDuringDay =
        effectiveMoment.isBefore(dayEnd) && expiryMoment.isAfter(dayEnd);
      const dayContained =
        effectiveMoment.isBefore(dayStart) && expiryMoment.isAfter(dayEnd);

      return (
        endsDuringDay || isContainedInDay || startsDuringDay || dayContained
      );
    });
    return warnings;
  }, [capData, date]);

  const uniqueWarnings = useMemo(() => {
    const currentUniqueWarnings: CapWarning[] = [];

    applicableWarnings?.forEach((warning) => {
      const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
      if (
        !currentUniqueWarnings.find(
          (w) => {
            const wInfo = Array.isArray(w.info) ? w.info[0] : w.info;
            return wInfo.event === info.event && wInfo.severity === info.severity
          }
        )
      ) {
        currentUniqueWarnings.push(warning);
      }
    });
    return currentUniqueWarnings;
  }, [applicableWarnings]);

  useEffect(() => setSelectedFilters([]), [date]);

  const mapRef = useRef<Map>(null);
  const { colors, dark } = useTheme() as CustomTheme;
  const capViewSettings = Config.get('warnings')?.capViewSettings;

  const darkGoogleMapsStyle =
    dark && Platform.OS === 'android' ? darkMapStyle : [];

  const polygonArray =
    applicableWarnings
      ?.map((warning) => {
        const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
        return {
          identifier: warning.identifier,
          event: info.event,
          severity: info?.severity,
          polygons: [info.area.polygon].flat().map((polygon, index) => ({
            key: `${warning.identifier}-${index}`,
            latLng: polygon
              ?.split(' ')
              .map((coordinates) =>
                coordinates.split(',').map((coordinate) => Number(coordinate))
              )
              .map((pair) => ({
                latitude: pair[0],
                longitude: pair[1],
              })),
          })),
      }})
      .flat() || [];

  const handleWarningTypePress = (warning: CapWarning) => {
    const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
    const { severity, event } = info;

    if (
      selectedFilters.find(
        (selectedFilter) =>
          selectedFilter?.severity === severity &&
          selectedFilter.event === event
      )
    ) {
      setSelectedFilters((filters) =>
        filters.filter(
          (filter) => filter.event !== event || filter.severity !== severity
        )
      );
    } else {
      setSelectedFilters((filters) => [...filters, { severity, event }]);
    }
  };

  const dailySeverities = useMemo<number[][]>(
    () =>
      getSeveritiesForDays(
        capData,
        dates.map(({ time }) => time)
      ),
    [capData, dates]
  );

  const backgroundOverlayColor = dark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';

  return (
    <View
      style={[styles.mapContainer, { height: capViewSettings?.mapHeight ?? 400 }]}>
      <Map
        style={styles.map}
        accessibilityElementsHidden
        ref={mapRef}
        testID="map"
        userInterfaceStyle={dark ? 'dark' : 'light'}
        customMapStyle={darkGoogleMapsStyle}
        initialRegion={capViewSettings?.initialRegion}
        rotateEnabled={false}
        toolbarEnabled={capViewSettings?.mapToolbarEnabled}
        onRegionChangeComplete={() => {}}
        onPress={() => {}}
        moveOnMarkerPress={false}
        scrollEnabled={capViewSettings?.mapScrollEnabled}
        zoomEnabled={capViewSettings?.mapZoomEnabled}>
        {polygonArray?.length > 0 &&
          polygonArray
            .filter(
              ({ event, severity }) =>
                !selectedFilters.find(
                  (filter) =>
                    filter.event === event && filter.severity === severity
                )
            )
            .map(({ severity, polygons }) =>
              polygons.map((polygon) => (
                <Polygon
                  coordinates={polygon.latLng}
                  key={polygon.key}
                  fillColor={SEVERITY_COLORS[severity]}
                  zIndex={SEVERITIES.indexOf(severity)}
                />
              ))
            )}
      </Map>
      { loading ? (
        Platform.OS === 'android' ?
          <ActivityIndicator size="large" color={colors.primary} />
          : (
            <View
              pointerEvents="none"
              style={[
                styles.loadingOverlay,
                { backgroundColor: backgroundOverlayColor },
              ]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )
      ) : (
        <>
          <DaySelectorList
            dates={dates}
            activeDay={selectedDay}
            onDayChange={(index) => setSelectedDay(index)}
            dailySeverities={dailySeverities}
          />
          <WarningTypeFiltersList
            warnings={uniqueWarnings}
            onWarningTypePress={handleWarningTypePress}
            activeWarnings={selectedFilters}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: GRAY_8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: -30,
    marginTop: -30,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
});

export default connector(MapView);

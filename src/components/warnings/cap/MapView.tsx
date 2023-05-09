import { Config } from '@config';
import { useTheme } from '@react-navigation/native';
import { CapWarning, Severity } from '@store/warnings/types';
import {
  CAP_WARNING_ORANGE,
  CAP_WARNING_RED,
  CAP_WARNING_YELLOW,
  CustomTheme,
  GRAY_8,
} from '@utils/colors';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Map, { Polygon } from 'react-native-maps';
import darkMapStyle from '@utils/dark_map_style.json';
import { getSeveritiesForDays } from '@utils/helpers';
import DaySelectorList from './DaySelectorList';
import WarningTypeFiltersList from './WarningTypeFiltersList';

const SEVERITY_COLORS: { [key: string]: string } = {
  Extreme: CAP_WARNING_RED,
  Severe: CAP_WARNING_ORANGE,
  Moderate: CAP_WARNING_YELLOW,
};

const SEVERITIES: Severity[] = ['Moderate', 'Severe', 'Extreme'];
const MapView = ({
  dates,
  capData,
}: {
  dates: { time: number; weekday: string; date: string }[];
  capData?: CapWarning[];
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
      const effectiveMoment = moment(warning.info.effective);
      const expiryMoment = moment(warning.info.expires);

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

  useEffect(() => setSelectedFilters([]), [date]);

  const mapRef = useRef() as React.MutableRefObject<Map>;
  const { dark } = useTheme() as CustomTheme;
  const capViewSettings = Config.get('warnings')?.capViewSettings;

  const darkGoogleMapsStyle =
    dark && Platform.OS === 'android' ? darkMapStyle : [];

  const polygonArray =
    applicableWarnings
      ?.map((warning) => ({
        identifier: warning.identifier,
        event: warning.info.event,
        severity: warning?.info?.severity,
        polygons: [warning?.info.area.polygon].flat().map((polygon, index) => ({
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
      }))
      .flat() || [];

  const handleWarningTypePress = (warning: CapWarning) => {
    const { severity, event } = warning.info;

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

  return (
    <View
      style={
        (styles.mapContainer, { height: capViewSettings?.mapHeight ?? 400 })
      }>
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
      <DaySelectorList
        dates={dates}
        activeDay={selectedDay}
        onDayChange={(index) => setSelectedDay(index)}
        dailySeverities={dailySeverities}
      />
      <WarningTypeFiltersList
        warnings={applicableWarnings}
        onWarningTypePress={handleWarningTypePress}
        activeWarnings={selectedFilters}
      />
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
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapView;

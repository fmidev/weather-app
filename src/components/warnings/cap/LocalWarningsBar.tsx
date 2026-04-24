import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { isPointInPolygon } from 'geolib';
import moment from 'moment';
import { connect, ConnectedProps } from 'react-redux';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon'
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { Config } from '@config';
import { CustomTheme } from '@assets/colors';
import { selectCurrent } from '@store/location/selector';
import { selectClockType } from '@store/settings/selectors';
import {
  selectCapWarningData,
  selectLoading,
} from '@store/warnings/selectors';
import { severityList } from '@store/warnings/constants';
import { State } from '@store/types';
import { CapInfo, CapWarning } from '@store/warnings/types';
import { getSeveritiesForDays, selectCapInfoByLanguage } from '@utils/helpers';
import CapSeverityBar from './CapSeverityBar';
import LocalWarningsDetails from './LocalWarningsDetails';
import { getBoundingBox, isPointInsideBoundingBox } from '@utils/map';
import type { Coordinate, BBox } from '@utils/map';
import PanelHeader from '@components/common/PanelHeader';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  currentLocation: selectCurrent(state),
  capWarnings: selectCapWarningData(state),
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux= ConnectedProps<typeof connector>;

type LocalWarningsBarProps = PropsFromRedux & {
  legendSheetRef: React.RefObject<any>;
};

type ParsedPolygon = {
  coordinates: Coordinate[];
  bbox: BBox;
};

type PreparedWarning = {
  warning: CapWarning;
  info: CapInfo;
  polygons: ParsedPolygon[];
};

const parsePolygon = (polygon: string): Coordinate[] =>
  polygon
    .split(' ')
    .map((coordinates) => coordinates.split(',').map(Number))
    .filter(
      (pair): pair is [number, number] =>
        pair.length === 2 && pair.every((coordinate) => !Number.isNaN(coordinate))
    )
    .map(([latitude, longitude]) => ({ latitude, longitude }));

const prepareWarning = (warning: CapWarning, language: string): PreparedWarning => {
  const info = Array.isArray(warning.info)
    ? selectCapInfoByLanguage(warning.info, language)
    : warning.info;
  const polygons = [info.area?.polygon]
    .flat()
    .filter(Boolean)
    .map((polygon) => parsePolygon(polygon))
    .map((coordinates) => {
      const bbox = getBoundingBox(coordinates);

      if (!bbox || coordinates.length < 3) {
        return null;
      }

      return { coordinates, bbox };
    })
    .filter((polygon): polygon is ParsedPolygon => Boolean(polygon));


  return { warning, info, polygons };
};

const warningContainsLocation = (warning: PreparedWarning, point: Coordinate) => {
  return (
    warning.polygons.some(
      ({ coordinates, bbox }) =>
        isPointInsideBoundingBox(point, bbox) &&
        isPointInPolygon(point, coordinates)
    )
  );
};

const overlapsDay = (info: CapInfo, day: moment.Moment) => {
  const dayStart = day.clone().startOf('day');
  const dayEnd = day.clone().endOf('day');

  return moment(info.effective).isSameOrBefore(dayEnd) &&
    moment(info.expires).isSameOrAfter(dayStart);
};

const LocalWarningsBar: React.FC<LocalWarningsBarProps> = ({
  loading,
  currentLocation,
  capWarnings,
  clockType,
  legendSheetRef,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('warnings');
  const capViewSettings = Config.get('warnings')?.capViewSettings;
  const [selectedDay, setSelectedDay] = useState(0);
  const colorMode = dark ? 'dark' : 'light';

  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  const dateFormat = locale === 'en' ? 'MMM D' : 'D.M.';
  moment.locale(locale);

  const preparedWarnings = useMemo(
    () => (capWarnings || []).map((warning) => prepareWarning(warning, locale)),
    [capWarnings, locale]
  );

  const localWarnings = useMemo(
    () => {
      if (!currentLocation || preparedWarnings.length === 0) {
        return [];
      }

      const point = {
        latitude: currentLocation.lat,
        longitude: currentLocation.lon,
      };
      const warnings = preparedWarnings.filter((warning) =>
        warningContainsLocation(warning, point)
      );
      return warnings;
    },
    [currentLocation, preparedWarnings]
  );

  const daySummaries = useMemo(() => {
    const dayCount = capViewSettings?.numberOfDays ?? 5;
    const startDay = moment(new Date()).hours(12).minutes(0).seconds(0).milliseconds(0);
    const dates = Array.from({ length: dayCount }, (_, index) =>
      startDay.clone().add(index, 'days')
    );
    const dailySeverities = getSeveritiesForDays(
      localWarnings.map(({ warning }) => warning),
      dates.map((date) => date.valueOf())
    );

    return dates.map((date, index) => {
      const count = localWarnings.filter(({ info }) => overlapsDay(info, date)).length;

      const severities = dailySeverities[index] ?? [0, 0, 0, 0];
      return {
        day: date,
        date: date.toISOString(),
        count,
        severities,
        highestSeverity: Math.max(...severities, 0),
      };
    });
  }, [capViewSettings?.numberOfDays, localWarnings]);

  const selectedDayWarnings = useMemo(() => {
    const activeDay = daySummaries[selectedDay]?.day;
    if (!activeDay) return [];

    return localWarnings
      .filter(({ info }) => overlapsDay(info, activeDay))
      .sort((left, right) => {
        return (
          severityList.indexOf(right.info.severity) -
          severityList.indexOf(left.info.severity)
        );
      })
      .map(({ warning }) => warning);
  }, [daySummaries, localWarnings, selectedDay]);

  useEffect(() => {
    setSelectedDay(0);
  }, [localWarnings]);

  if (loading) {
    return (
      <MotiView style={{backgroundColor: colors.background}}>
        <View style={styles.loading}>
          <Skeleton colorMode={colorMode} width={'100%'} height={40} radius={10} />
        </View>
        <View style={styles.loading}>
          <Skeleton colorMode={colorMode} width={'100%'} height={65} radius={10} />
        </View>
        <View style={[styles.loading, styles.loadingLast]}>
          <Skeleton colorMode={colorMode} width={'100%'} height={40} radius={10} />
        </View>
      </MotiView>
    );
  }


  if (!currentLocation) return null;

  return (
    <View style={{ backgroundColor: colors.background }}>
      <PanelHeader title={t('panelTitle')} justifyCenter />
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide} />
          <View style={styles.headerTitleWrapper}>
            <Text style={[styles.headerText, styles.bold, { color: colors.primaryText }]}>
              {currentLocation.name}
            </Text>
          </View>
          <View style={styles.headerSide}>
            <AccessibleTouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('infoAccessibilityLabel')}
              accessibilityHint={t('infoAccessibilityHint')}
              style={styles.infoButton}
              onPress={() => legendSheetRef.current?.open()}>
              <Icon
                name="info"
                color={colors.primaryText}
                height={24}
                width={24}
              />
            </AccessibleTouchableOpacity>
          </View>
        </View>
        <View
          style={[
            styles.weekWarningsContainer,
            {
              borderColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.warningDaysContainer,
              {
                borderColor: colors.border,
              },
            ]}>
            {daySummaries.map(({ date, count, severities, highestSeverity }, index) => (
              <View
                key={date}
                style={styles.dayColumn}
                accessible
                accessibilityLabel={`${moment(date).format('dddd DD MMMM')}, ${t(
                  'hasWarnings'
                )}: ${count}${count > 0 ? `, ${t(`warnings:highestSeverity`)}: ${t(`warnings:severities:${highestSeverity}`)}` : ''}`}>
                {count > 0 && (
                  <View
                    accessibilityElementsHidden
                    style={[
                      styles.countBadge,
                      {
                        borderColor: colors.primaryText,
                        backgroundColor: colors.background,
                      },
                    ]}>
                    <Text
                      maxFontSizeMultiplier={1.5}
                      style={[styles.badgeText, { color: colors.primaryText }]}>
                      {count}
                    </Text>
                  </View>
                )}
                <AccessibleTouchableOpacity
                  style={styles.dayTouchable}
                  onPress={() => setSelectedDay(index)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === selectedDay }}
                  accessibilityHint={
                    index === selectedDay ? '' : t('dateOpenHint')
                  }>
                  <View
                    style={[
                      styles.warningsSingleDayContainer,
                      index === 0 && styles.startBorderRadius,
                      index === daySummaries.length - 1 && styles.endBorderRadius,
                      index < daySummaries.length - 1 && styles.withBorderRight,
                      {
                        backgroundColor:
                          index === selectedDay
                            ? colors.selectedDayBackground
                            : undefined,
                        borderRightColor: colors.border,
                      },
                    ]}>
                    <View
                      style={[
                        styles.activeBorder,
                        index === selectedDay && {
                          backgroundColor: colors.tabBarActive,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.cardText,
                        index === selectedDay ? styles.bold : styles.medium,
                        styles.dayWarningHeaderText,
                        { color: colors.primaryText },
                      ]}>
                      {moment(date).format(weekdayAbbreviationFormat)}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={1.5}
                      style={[
                        styles.cardText,
                        index === selectedDay ? styles.bold : styles.medium,
                        styles.dayWarningHeaderText,
                        { color: colors.primaryText },
                      ]}>
                      {moment(date).format(dateFormat)}
                    </Text>
                    <View style={styles.severityBarWrapper}>
                      <CapSeverityBar severities={severities} />
                    </View>
                  </View>
                </AccessibleTouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <LocalWarningsDetails
          warnings={selectedDayWarnings}
          clockType={clockType}
          locale={locale}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingTop: 8,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  weekWarningsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  warningDaysContainer: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
  dayTouchable: {
    flex: 1,
  },
  countBadge: {
    position: 'absolute',
    elevation: 5,
    zIndex: 5,
    right: 6,
    top: -14,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  badgeText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
  },
  warningsSingleDayContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 65,
  },
  activeBorder: {
    height: 3,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  startBorderRadius: {
    borderTopLeftRadius: 4,
  },
  endBorderRadius: {
    borderTopRightRadius: 4,
  },
  withBorderRight: {
    borderRightWidth: 1,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  dayWarningHeaderText: {
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  severityBarWrapper: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  loadingLast: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connector(LocalWarningsBar);

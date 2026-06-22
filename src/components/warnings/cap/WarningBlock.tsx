import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { Severity, CapWarning } from '@store/warnings/types';
import { CustomTheme } from '@assets/colors';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';
import { getSeveritiesForDays, selectCapInfoByLanguage } from '@utils/helpers';
import { State } from '@store/types';
import { selectClockType } from '@store/settings/selectors';
import { connect } from 'react-redux';
import { ClockType } from '@store/settings/types';
import WarningItem from './WarningItem';
import { Config } from '@config';

const severities: Severity[] = ['Moderate', 'Severe', 'Extreme'];

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps);

function WarningBlock({
  clockType,
  dates,
  warnings,
  xOffset,
}: Readonly<{
  clockType: ClockType;
  dates: { time: number; date: string; weekday: string }[];
  warnings: CapWarning[];
  xOffset?: number;
}>) {
  const { default: defaultLocation } = Config.get('location');
  const [open, setOpen] = useState(false);
  const { colors } = useTheme() as CustomTheme;
  const scrollViewRef = useRef<ScrollView>(null);
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const sortedWarnings = useMemo(() => [...warnings].sort((a, b) => {
    const aInfo = Array.isArray(a.info) ? selectCapInfoByLanguage(a.info, locale) : a.info;
    const bInfo = Array.isArray(b.info) ? selectCapInfoByLanguage(b.info, locale) : b.info;

    const severityDiff =
      severities.indexOf(bInfo.severity) - severities.indexOf(aInfo.severity);

    if (severityDiff !== 0) return severityDiff;

    return (
      moment(aInfo.onset).toDate().getTime() - moment(bInfo.onset).toDate().getTime()
    );
  }), [warnings, locale]);

  const dailySeverities = getSeveritiesForDays(
    sortedWarnings,
    dates.map(({ time }) => time),
    defaultLocation.timezone
  );

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: xOffset ?? 0,
      y: 0,
      animated: true,
    });
  }, [xOffset]);

  const headerWarning = useMemo(() => {
    let mostSevere = sortedWarnings[0];

    sortedWarnings.forEach((warning) => {
      const info = Array.isArray(warning.info) ? selectCapInfoByLanguage(warning.info, locale) : warning.info;
      const currentMostSevereInfo =
        Array.isArray(mostSevere.info) ? selectCapInfoByLanguage(mostSevere.info, locale) : mostSevere.info;

      const currentSeverity = severities.indexOf(currentMostSevereInfo.severity);
      const severity = severities.indexOf(info.severity);

      if (severity > currentSeverity) {
        mostSevere = warning;
      }
    });

    return mostSevere;
  }, [sortedWarnings, locale]);

  const headerWarningAreas = [
    ...new Set(
      sortedWarnings
        .map((warning) => Array.isArray(warning.info) ?
          selectCapInfoByLanguage(warning.info, locale).area.areaDesc : warning.info.area.areaDesc)
        .map((area) => area.charAt(0).toUpperCase().concat(area.substring(1)))
    ),
  ].join(', ');

  const getHeaderWarningTimeSpans = (capWarnings: CapWarning[]): string[] => {
    const timespans = capWarnings.map((warning) => {
      const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
      return {
        onset: info.onset,
        expiry: info.expires,
      }
    });
    timespans.sort(
      (span1, span2) =>
        moment(span1.onset).toDate().getTime() -
        moment(span2.onset).toDate().getTime()
    );

    if (timespans.length === 0) return [];

    const intervals = [];
    let currentInterval = {
      onset: moment(timespans[0].onset),
      expiry: moment(timespans[0].expiry),
    };

    timespans.slice(1).forEach((span) => {
      const onset = moment(span.onset);
      const expiry = moment(span.expiry);

      if (onset.toDate().getTime() < currentInterval.expiry.toDate().getTime()) {
        if (expiry.toDate().getTime() > currentInterval.expiry.toDate().getTime()) {
          currentInterval.expiry = expiry;
        }
      } else {
        intervals.push(currentInterval);
        currentInterval = { onset, expiry };
      }
    });
    intervals.push(currentInterval);

    return intervals.map(({ onset, expiry }) => {
      const onsetFormatted = onset.formatDateTime('weekdayAbbreviationAndDate', locale);

      if (onset.isSame(expiry, 'day')) return onsetFormatted;

      const expiryFormatted = expiry
        .locale(locale)
        .formatDateTime('weekdayAbbreviationAndDate', locale);;
      return `${onsetFormatted} - ${expiryFormatted}`;
    });
  };
  const headerTimeSpanString = [
    ...new Set(getHeaderWarningTimeSpans(sortedWarnings)),
  ].join(', ');

  const warningTimeSpans = sortedWarnings.map((warning) => {
    const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
    const start = moment(info.onset).tz(defaultLocation.timezone);
    const end = moment(info.expires).tz(defaultLocation.timezone);
    const startFormatted = `${start.formatDateTime(
        'weekdayAbbreviationAndDate',
        locale
      )} ${start.formatDateTime('time', locale, clockType)}`;

    const endFormatted = start.isSame(end, 'day')
      ? end.formatDateTime('time', locale, clockType)
      : `${end.formatDateTime(
        'weekdayAbbreviationAndDate',
        locale
      )} ${end.formatDateTime('time', locale, clockType)}`;
    return `${startFormatted} - ${endFormatted}`;
  });

  return (
    <View>
      <AccessibleTouchableOpacity onPress={() => setOpen(!open)}>
        <WarningItem
          areasDescription={headerWarningAreas}
          warning={headerWarning}
          warningCount={warnings.length}
          includeArrow
          includeSeverityBars
          dailySeverities={dailySeverities}
          open={open}
          scrollViewRef={scrollViewRef}
          timespan={headerTimeSpanString}
        />
      </AccessibleTouchableOpacity>
      {open && (
        <View
          style={[
            styles.openableContent,
            { backgroundColor: colors.accordionContentBackground },
          ]}>
          {sortedWarnings.map((warning, index) => {
            const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
            return (
              <WarningItem
                key={`${warning.identifier}-${info.area.areaDesc}`}
                warning={warning}
                includeArrow={false}
                includeSeverityBars={false}
                showDescription
                timespan={warningTimeSpans[index]}
              />
            )}
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  openableContent: {},
});

export default connector(WarningBlock);

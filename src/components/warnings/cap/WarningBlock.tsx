import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { Severity, CapWarning } from '@store/warnings/types';
import { CustomTheme } from '@assets/colors';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { getSeveritiesForDays, selectCapInfoByLanguage } from '@utils/helpers';
import { State } from '@store/types';
import { selectClockType } from '@store/settings/selectors';
import { connect } from 'react-redux';
import { ClockType } from '@store/settings/types';
import WarningItem from './WarningItem';

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
  const [open, setOpen] = useState(false);
  const { colors } = useTheme() as CustomTheme;
  const scrollViewRef = useRef<ScrollView>(null);
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';
  const timeFormat = clockType === 12 ? 'h.mm a' : 'HH.mm';

  const sortedWarnings = useMemo(() => [...warnings].sort((a, b) => {
    const aInfo = Array.isArray(a.info) ? selectCapInfoByLanguage(a.info, locale) : a.info;
    const bInfo = Array.isArray(b.info) ? selectCapInfoByLanguage(b.info, locale) : b.info;

    const severityDiff =
      severities.indexOf(bInfo.severity) - severities.indexOf(aInfo.severity);

    if (severityDiff !== 0) return severityDiff;

    return (
      moment(aInfo.effective).toDate().getTime() - moment(bInfo.effective).toDate().getTime()
    );
  }), [warnings, locale]);

  const dailySeverities = getSeveritiesForDays(
    sortedWarnings,
    dates.map(({ time }) => time)
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
        effective: info.effective,
        expiry: info.expires,
      }
    });
    timespans.sort(
      (span1, span2) =>
        moment(span1.effective).toDate().getTime() -
        moment(span2.effective).toDate().getTime()
    );
    const intervals = [];

    let index = 0;
    let currentTimespan = timespans[index];
    let spans = [];

    while (index < timespans.length) {
      const span = timespans[index];
      // Get all timespans that begin before current has ended

      if (
        moment(span.effective).toDate().getTime() <
        moment(currentTimespan.expiry).toDate().getTime()
      ) {
        spans.push({
          timespan: span,
          time: moment(span.expiry).toDate().getTime(),
          index,
        });
      } else {
        const lastToExpire = Math.max(...spans.map((s) => s.time));
        intervals.push({
          effective: moment(currentTimespan.effective),
          expiry: moment(lastToExpire),
        });
        currentTimespan = timespans[index];
        spans = [];
      }

      index += 1;
    }

    if (currentTimespan && (spans.length === 0 || intervals.length === 0)) {
      intervals.push({
        effective: moment(currentTimespan.effective),
        expiry: moment(currentTimespan.expiry),
      });
    }

    return intervals.map(({ effective, expiry }) => {
      const effectiveFormatted = effective
        .locale(locale)
        .format(`${weekdayAbbreviationFormat} ${dateFormat}`);

      if (effective.isSame(expiry, 'day')) return effectiveFormatted;

      const expiryFormatted = expiry
        .locale(locale)
        .format(`${weekdayAbbreviationFormat} ${dateFormat}`);
      return `${effectiveFormatted} - ${expiryFormatted}`;
    });
  };
  const headerTimeSpanString = [
    ...new Set(getHeaderWarningTimeSpans(sortedWarnings)),
  ].join(', ');

  const warningTimeSpans = sortedWarnings.map((warning) => {
    const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
    const start = moment(info.effective);
    const end = moment(info.expires);
    const startFormatted = start
      .locale(locale)
      .format(`${weekdayAbbreviationFormat} ${dateFormat} ${timeFormat}`);

    const endFormatted = end
      .locale(locale)
      .format(
        start.isSame(end, 'day')
          ? timeFormat
          : `${weekdayAbbreviationFormat} ${dateFormat} ${timeFormat}`
      );
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

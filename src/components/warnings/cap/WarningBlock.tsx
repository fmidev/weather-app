import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { Severity, CapWarning, WarningType } from '@store/warnings/types';
import { CustomTheme, GRAYISH_BLUE, GRAY_4 } from '@assets/colors';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Icon from '@assets/Icon';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { getSeveritiesForDays } from '@utils/helpers';
import { State } from '@store/types';
import { selectClockType } from '@store/settings/selectors';
import { connect } from 'react-redux';
import { ClockType } from '@store/settings/types';
import WarningSymbol from '../WarningsSymbol';
import CapSeverityBar from './CapSeverityBar';

const severities: Severity[] = ['Moderate', 'Severe', 'Extreme'];

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps);

const WarningItem = ({
  areasDescription,
  warning,
  warningCount,
  scrollViewRef,
  width,
  timespan,
  includeSeverityBars,
  dailySeverities,
  open,
  includeArrow,
  showDescription,
}: {
  areasDescription?: string;
  warning: CapWarning;
  warningCount?: number;
  scrollViewRef?: React.MutableRefObject<ScrollView>;
  width: number;
  timespan: string;
  includeSeverityBars: boolean;
  dailySeverities?: number[][];
  open?: boolean;
  includeArrow: boolean | undefined;
  showDescription?: boolean;
}) => {
  const { colors } = useTheme() as CustomTheme;
  const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
  const areaDesc = info.area.areaDesc
    .charAt(0)
    .toUpperCase()
    .concat(info.area.areaDesc.substring(1));

  return (
    <View>
      <View
        style={[
          styles.headingContainer,
          showDescription && styles.noBorderBottom,
          {
            backgroundColor: !showDescription ? colors.background : undefined,
          },
        ]}>
        <WarningSymbol
          type={info.event as WarningType}
          severity={info.severity}
          size={32}
        />
        <View style={[styles.headingMainContent, { width: width - 136 }]}>
          {includeSeverityBars && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              style={[
                styles.row,
                styles.severityBarContainer,
                { width: width - 136 },
              ]}
              ref={scrollViewRef}>
              {dailySeverities?.map((daySeverities, index) => (
                <CapSeverityBar key={`${index}-${daySeverities.toString()}`} severities={daySeverities} />
              ))}
            </ScrollView>
          )}
          <Text style={[styles.headingTitle, { color: colors.hourListText }]}>
            {(info.event as WarningType) ? info.event : ''}
            {warningCount && warningCount > 1 ? ` (${warningCount} pcs)` : ''}
          </Text>
          <Text style={[styles.headingText, { color: colors.hourListText }]}>
            {timespan}
          </Text>
          <Text style={[styles.headingText]}>
            {areasDescription || areaDesc}
          </Text>
        </View>
        {includeArrow && (
          <View style={styles.accordionArrow}>
            <Icon
              name={open ? 'arrow-up' : 'arrow-down'}
              height={24}
              width={24}
              color={colors.primaryText}
            />
          </View>
        )}
      </View>

      {showDescription && (
        <View style={styles.warningDescription}>
          <Text style={{ color: GRAY_4 }}>{info.description}</Text>
        </View>
      )}
    </View>
  );
};

function WarningBlock({
  clockType,
  dates,
  warnings,
  xOffset,
}: {
  clockType: ClockType;
  dates: { time: number; date: string; weekday: string }[];
  warnings: CapWarning[];
  xOffset?: number;
}) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme() as CustomTheme;
  const scrollViewRef = useRef() as React.MutableRefObject<ScrollView>;
  const { width } = useWindowDimensions();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';
  const timeFormat = clockType === 12 ? 'h.mm a' : 'HH.mm';

  const dailySeverities = getSeveritiesForDays(
    warnings,
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
    let mostSevere = warnings[0];
    warnings.forEach((warning) => {
      const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
      const currentSeverity = severities.indexOf(info.severity);
      const severity = severities.indexOf(info.severity);
      if (severity > currentSeverity) {
        mostSevere = warning;
      }
    });
    return mostSevere;
  }, [warnings]);

  const headerWarningAreas = [
    ...new Set(
      warnings
        .map((warning) => Array.isArray(warning.info) ? warning.info[0].area.areaDesc : warning.info.area.areaDesc)
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
    ...new Set(getHeaderWarningTimeSpans(warnings)),
  ].join(', ');

  const warningTimeSpans = warnings.map((warning) => {
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
          width={width}
        />
      </AccessibleTouchableOpacity>
      {open && (
        <View
          style={[
            styles.openableContent,
            { backgroundColor: colors.accordionContentBackground },
          ]}>
          {warnings.map((warning, index) => {
            const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
            return (
              <WarningItem
                key={`${warning.identifier}-${info.area.areaDesc}`}
                warning={warning}
                includeArrow={false}
                includeSeverityBars={false}
                width={width}
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
  headingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: GRAYISH_BLUE,
    paddingLeft: 16,
    width: '100%',
    flexGrow: 0,
  },
  noBorderBottom: {
    borderBottomWidth: 0,
  },
  severityBarContainer: {
    marginBottom: 12,
  },
  accordionArrow: {
    padding: 10,
    marginRight: 14,
  },
  headingMainContent: {
    flexDirection: 'column',
    marginVertical: 15,
    marginLeft: 16,
    flexGrow: 1,
  },
  headingTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
  },
  headingText: {
    fontSize: 16,
  },
  openableContent: {},
  row: {
    flexDirection: 'row',
  },
  warningDescription: {
    marginHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: GRAYISH_BLUE,
  },
});

export default connector(WarningBlock);

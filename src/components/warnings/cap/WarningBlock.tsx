import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { Severity, CapWarning } from '@store/warnings/types';
import { CustomTheme, GRAYISH_BLUE } from '@utils/colors';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Icon from '@components/common/Icon';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { getSeveritiesForDays } from '@utils/helpers';
import WarningSymbol from '../WarningsSymbol';
import CapSeverityBar from './CapSeverityBar';

const severities: Severity[] = ['Moderate', 'Severe', 'Extreme'];

const WarningItem = ({
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
  return (
    <View>
      <View
        style={[
          styles.headingContainer,
          { backgroundColor: !showDescription ? colors.background : undefined },
        ]}>
        <WarningSymbol
          type="coldWeather"
          severity={warning.info.severity}
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
              {dailySeverities?.map((daySeverities) => (
                <CapSeverityBar severities={daySeverities} />
              ))}
            </ScrollView>
          )}
          <Text style={[styles.headingTitle, { color: colors.hourListText }]}>
            {warning.info.event} {warningCount ? `(${warningCount})` : ''}
          </Text>
          <Text style={[styles.headingText, { color: colors.hourListText }]}>
            {timespan}
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
        <View>
          <Text>{warning.info.description}</Text>
        </View>
      )}
    </View>
  );
};
function WarningBlock({
  dates,
  warnings,
  xOffset,
}: {
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
      const currentSeverity = severities.indexOf(mostSevere.info.severity);
      const severity = severities.indexOf(warning.info.severity);
      if (severity > currentSeverity) {
        mostSevere = warning;
      }
    });
    return mostSevere;
  }, [warnings]);

  const getHeaderWarningTimeSpans = (capWarnings: CapWarning[]): string[] => {
    const onsetSet = new Set<Date>();
    const expiresSet = new Set<Date>();
    capWarnings.forEach((warning: CapWarning) => {
      onsetSet.add(warning.info.onset);
      expiresSet.add(warning.info.expires);
    });
    const uniqueOnsetDates = [...onsetSet];
    const uniqueExpiryDates = [...expiresSet];
    const intervals: { onsetDate: Date; expiryDate: Date }[] = [];

    uniqueOnsetDates.forEach((onsetDate) => {
      const expiryDate = uniqueExpiryDates[0];
      intervals.push({ onsetDate, expiryDate });
    });

    return intervals.map((interval) => {
      const start = moment(interval.onsetDate)
        .locale(locale)
        .format(`${weekdayAbbreviationFormat} ${dateFormat}`);

      const end = moment(interval.expiryDate)
        .locale(locale)
        .format(`${weekdayAbbreviationFormat} ${dateFormat}`);

      return start === end ? start : `${start} - ${end}`;
    });
  };
  const headerTimeSpanString = [
    ...new Set(getHeaderWarningTimeSpans(warnings)),
  ].join(', ');

  const warningTimeSpans = warnings.map(
    (warning) =>
      `${moment(warning.info.onset)
        .locale(locale)
        .format(`${weekdayAbbreviationFormat} ${dateFormat}`)} - ${moment(
        warning.info.expires
      )
        .locale(locale)
        .format(`${weekdayAbbreviationFormat} ${dateFormat}`)}`
  );

  return (
    <View>
      <AccessibleTouchableOpacity onPress={() => setOpen(!open)}>
        <WarningItem
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
          {warnings.map((warning, index) => (
            <>
              <WarningItem
                warning={warning}
                includeArrow={false}
                includeSeverityBars={false}
                width={width}
                showDescription
                timespan={warningTimeSpans[index]}
              />
            </>
          ))}
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
});

export default WarningBlock;

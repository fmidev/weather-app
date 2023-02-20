import React, { useCallback, useMemo, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GRAYISH_BLUE, CustomTheme } from '@utils/colors';
import { CapWarning } from '@store/warnings/types';
import WarningBlock from './WarningBlock';

const DateIndicator = ({
  weekDay,
  date,
}: {
  weekDay: string;
  date: string;
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View style={styles.dateIndicatorEntry}>
      <Text style={[styles.capitalized, { color: colors.hourListText }]}>
        {weekDay}
      </Text>
      <Text style={{ color: colors.hourListText }}>{date}</Text>
    </View>
  );
};

const TextList = ({
  capData,
  dates,
}: {
  capData?: CapWarning[];
  dates: { time: number; date: string; weekday: string }[];
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { width } = useWindowDimensions();
  const [xOffset, setXOffset] = useState<number>(0);

  const groupAlerts = useCallback((data?: CapWarning[]) => {
    const alerts: { [key: string]: CapWarning[] } = {};
    data?.forEach((alert) => {
      alerts[alert.info.event] =
        alert.info.event in alerts
          ? [...alerts[alert.info.event], alert]
          : [alert];
    });
    return alerts;
  }, []);

  const groupedWarnings = useMemo<{ [key: string]: CapWarning[] }>(
    () => groupAlerts(capData),
    [capData, groupAlerts]
  );
  return (
    <>
      <View
        style={[
          styles.dateIndicatorPanel,
          { backgroundColor: colors.background },
        ]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.dateIndicatorRow, { width: width - 136 }]}
          onScroll={(e) => setXOffset(e.nativeEvent.contentOffset.x)}>
          {dates.map(({ time, weekday, date }) => (
            <DateIndicator
              key={`indicator-${time}`}
              weekDay={weekday}
              date={date}
            />
          ))}
        </ScrollView>
      </View>
      {Object.keys(groupedWarnings)?.map((warningGroup) => (
        <WarningBlock
          warnings={groupedWarnings[warningGroup]}
          key={warningGroup}
          xOffset={xOffset}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  capitalized: {
    textTransform: 'capitalize',
  },
  dateIndicatorPanel: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: GRAYISH_BLUE,
  },
  dateIndicatorRow: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 64,
  },
  dateIndicatorEntry: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 7,
    width: 45,
  },
});

export default TextList;

import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, GRAYISH_BLUE } from '@assets/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CapSeverityBar from './CapSeverityBar';

const DaySelector = ({
  active,
  onSelect,
  index,
  severities,
  weekday,
  date,
  last,
}: {
  active: boolean;
  onSelect: (arg0: number) => void;
  index: number;
  severities?: number[];
  weekday: string;
  date: string;
  last?: boolean;
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <AccessibleTouchableOpacity
      onPress={() => onSelect(index)}
      activeOpacity={1}>
      <View
        style={[
          styles.dayBlock,
          index === 0 && styles.roundedLeftCorners,
          last && styles.roundedRightCorners,
          {
            borderTopColor: active ? colors.tabBarActive : colors.background,
            borderRightColor: GRAYISH_BLUE,
            backgroundColor: active
              ? colors.screenBackground
              : colors.background,
          },
        ]}>
        <Text
          style={[
            styles.text,
            styles.capitalized,
            { color: colors.primaryText },
          ]}>
          {weekday}
        </Text>
        <Text style={[styles.text, { color: colors.primaryText }]}>{date}</Text>
        <View style={styles.severityBarContainer}>
          <CapSeverityBar severities={severities ?? [0, 0, 0, 0]} />
        </View>
      </View>
    </AccessibleTouchableOpacity>
  );
};

const DaySelectorList = ({
  activeDay,
  dates,
  dailySeverities,
  onDayChange,
}: {
  activeDay: number;
  dates: { weekday: string; date: string; time: number }[];
  dailySeverities: number[][];
  onDayChange: (arg0: number) => void;
}) => (
  <ScrollView
    style={styles.container}
    horizontal
    showsHorizontalScrollIndicator={false}>
    <View style={styles.row}>
      {dates.map(({ time, weekday, date }, index) => (
        <DaySelector
          active={activeDay === index}
          key={time}
          weekday={weekday}
          date={date}
          onSelect={() => onDayChange(index)}
          severities={dailySeverities[index]}
          index={index}
          last={index === dates.length - 1}
        />
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  capitalized: {
    textTransform: 'capitalize',
  },
  container: {
    position: 'absolute',
    top: 12,
  },
  dayBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    borderTopWidth: 3,
    width: 70,
    paddingVertical: 8,
    borderRightWidth: 1,
  },
  roundedLeftCorners: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  roundedRightCorners: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  severityBarContainer: {
    marginTop: 8,
  },
  text: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
});

export default DaySelectorList;

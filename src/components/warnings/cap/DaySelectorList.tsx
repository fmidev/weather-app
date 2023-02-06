import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, GRAYISH_BLUE } from '@utils/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CapSeverityBar from './CapSeverityBar';

const severitiesMock = [
  [2, 2, 2, 2],
  [3, 3, 2, 2],
  [2, 2, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [3, 3, 3, 3],
];

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
  severities: number[];
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
          <CapSeverityBar severities={severities} />
        </View>
      </View>
    </AccessibleTouchableOpacity>
  );
};

const DaySelectorList = ({
  dates,
}: {
  dates: { weekday: string; date: string }[];
}) => {
  const [activeDay, setActiveDay] = useState(1);
  return (
    <ScrollView
      style={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {dates.map(({ weekday, date }, index) => (
          <DaySelector
            active={index === activeDay}
            key={weekday}
            weekday={weekday}
            date={date}
            onSelect={() => setActiveDay(index)}
            severities={severitiesMock[index] ?? [3, 3, 3, 3]}
            index={index}
            last={index === dates.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
};

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

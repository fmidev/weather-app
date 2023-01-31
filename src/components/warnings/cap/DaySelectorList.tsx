import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, GRAYISH_BLUE, WHITE } from '@utils/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CapSeverityBar from './CapSeverityBar';

const data = [
  { weekday: 'Ke', date: '23.11.', severities: [2, 2, 2, 2] },
  { weekday: 'To', date: '24.11.', severities: [3, 3, 2, 2] },
  { weekday: 'Pe', date: '25.11.', severities: [2, 2, 1, 0] },
  { weekday: 'La', date: '26.11.', severities: [0, 0, 0, 0] },
  { weekday: 'Su', date: '27.11.', severities: [0, 0, 0, 0] },
  { weekday: 'Ma', date: '28.11.', severities: [0, 0, 0, 0] },
  { weekday: 'Ti', date: '29.11.', severities: [3, 3, 3, 3] },
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
            borderTopColor: active ? colors.tabBarActive : WHITE,
            borderRightColor: GRAYISH_BLUE,
            backgroundColor: active ? colors.screenBackground : WHITE,
          },
        ]}>
        <Text style={[styles.text, { color: colors.primaryText }]}>
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

const DaySelectorList = () => {
  const [activeDay, setActiveDay] = useState(1);
  return (
    <ScrollView
      style={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {data.slice(0, 5).map(({ weekday, date, severities }, index) => (
          <DaySelector
            active={index === activeDay}
            key={weekday}
            weekday={weekday}
            date={date}
            onSelect={() => setActiveDay(index)}
            severities={severities}
            index={index}
            last={index === data.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
  },
  dayBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: WHITE,
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

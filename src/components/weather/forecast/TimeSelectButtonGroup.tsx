import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import HourSelectorButton from '@components/common/HourSelectorButton';

type TimeSelectButtonGroupProps = {
  onTimeSelect?: (hour: number) => void;
  startHour: number;
  endHour: number;
  selectedHour: number;
};

const formatText = (hour: number) => {
  const start = hour.toString().padStart(2, '0');
  const end = (hour + 5).toString().padStart(2, '0');
  return `${start}-${end}`;
}

const TimeSelectButtonGroup: React.FC<TimeSelectButtonGroupProps> = ({
  onTimeSelect,
  startHour,
  endHour,
  selectedHour
}) => {

  const [selected, setSelected] = useState(selectedHour);
  const hours = [0, 6, 12, 17]

  useEffect(() => {
    setSelected(selectedHour);
  }, [selectedHour]);

  return (
    <View style={styles.center}>
      <View style={[styles.container]}>
      {
        hours.map((hour, index) => {
          const active = selected >= hour && selected < hour + 5
          const text = formatText(hour);
          return (
            <View style={[styles.flex, styles.flexRow]} key={hour}>
              <HourSelectorButton
                active={ active }
                disabled={ hour > endHour || hour + 5 < startHour }
                text={text}
                accessibilityHint={text}
                onPress={ hour + 5 < startHour ? () => {} : () => {
                  setSelected(hour);
                  if (onTimeSelect) {
                    onTimeSelect(Math.max(startHour, hour));
                  }
                }}
              />
              { index !== hours.length - 1 && <View style={styles.separator} /> }
            </View>
          )})
      }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center : {
    alignItems: 'center',
  },
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(197, 197, 222, 0.12)',
    marginBottom: 16,
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  // eslint-disable-next-line react-native/no-color-literals
  separator: {
    width: 1,
    marginTop: 5,
    height: 22,
    borderRightColor: '#C7C7CC',
    borderRightWidth: 1,
  },
})

export default TimeSelectButtonGroup;
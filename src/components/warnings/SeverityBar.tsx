import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GREEN, ORANGE, RED, YELLOW } from '@assets/colors';

type SeverityBarProps = {
  severity: number;
};

const SeverityBar: React.FC<SeverityBarProps> = ({ severity }) => {
  const colors = [GREEN, YELLOW, ORANGE, RED];
  const bars = severity + 1;
  const color = colors[severity];

  const Bars = [];
  for (let i = 0; i < bars; i += 1) {
    Bars.push(
      <View
        key={`severityBar-${i}`}
        style={[
          styles.severityBar,
          bars !== 0 && i < bars - 1 && styles.marginRight,
          bars !== 0 && i !== 0 && styles.marginLeft,
          { backgroundColor: color },
        ]}
      />
    );
  }

  return <View style={styles.container}>{Bars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  marginLeft: {
    marginLeft: 1,
  },
  marginRight: {
    marginRight: 1,
  },
  severityBar: {
    flex: 1,
    height: 5,
    borderWidth: 1,
  },
});

export default SeverityBar;

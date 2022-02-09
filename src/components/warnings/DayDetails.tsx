import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';
import { Severity, Warning, WarningType } from '@store/warnings/types';
import { TouchableOpacity } from 'react-native-gesture-handler';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

type DayDetailsProps = {
  warnings: Warning[];
};

const DayDetails: React.FC<DayDetailsProps> = ({ warnings }) => {
  const { t } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;
  const [openWarnings, setOpenWarnings] = useState<{
    [index: number]: boolean;
  }>([]);

  useEffect(() => {
    setOpenWarnings([]);
  }, [warnings, setOpenWarnings]);

  const WarningSymbol = ({
    type,
    severity,
  }: {
    type: WarningType;
    severity: Severity;
  }) => {
    const colorMap: { [key in Severity]: string } = {
      Moderate: 'yellow',
      Severe: 'orange',
      Extreme: 'red',
    };

    const typeMap: { [key in WarningType]: string } = {
      thunderStorm: 'thunder-storm',
      wind: 'wind',
      rain: 'rain',
      trafficWeather: 'traffic-weather',
      pedestrianSafety: 'pedestrian-safety',
      forestFireWeather: 'forest-fire',
      grassFireWeather: 'grass-fire-weather',
      hotWeather: 'hot-weather',
      coldWeather: 'hot-weather',
      uvNote: 'uv-note',
      // floodLevel: 'flood-level',
    };

    let name = `warnings${typeMap[type] ? `-${typeMap[type]}` : ''}`;

    if (!['uvNote', 'grassFireWeather', 'pedestrianSafety'].includes(type)) {
      name += `-${colorMap[severity]}`;
    }

    return <Icon name={name} width={24} height={24} />;
  };

  if (warnings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {warnings.map(({ description, type, severity, duration }, index) => (
        <View key={`${type}-${severity}`}>
          <View style={styles.flex}>
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                setOpenWarnings({
                  ...openWarnings,
                  [index]: !openWarnings[index],
                })
              }>
              <View style={styles.iconPadding}>
                <WarningSymbol type={type} severity={severity} />
              </View>
              <View style={styles.flex}>
                <Text
                  style={[styles.headerText, { color: colors.secondaryText }]}>
                  <Text style={styles.bold}>{`${t(`types.${type}`)}`}</Text>
                  {` – ${t('valid')} ${moment(duration.startTime).format(
                    'DD.MM. HH:mm'
                  )} - ${moment(duration.endTime).format('DD.MM. HH:mm')} `}
                </Text>
              </View>
              <View style={styles.iconPadding}>
                <Icon
                  name={openWarnings[index] ? 'arrow-up' : 'arrow-down'}
                  width={24}
                  height={24}
                  style={{ color: colors.text }}
                />
              </View>
            </TouchableOpacity>
          </View>
          {openWarnings[index] && (
            <View style={styles.body}>
              <Text
                style={[styles.description, { color: colors.secondaryText }]}>
                {description}
              </Text>
            </View>
          )}
          {index !== warnings.length - 1 && (
            <View style={[styles.separator, { borderColor: colors.border }]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconPadding: {
    padding: 5,
  },
  flex: {
    flex: 1,
  },
  headerText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    paddingHorizontal: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  body: {
    paddingTop: 10,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
export default DayDetails;

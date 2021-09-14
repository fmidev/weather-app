import React, { ReactElement } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { SvgProps } from 'react-native-svg';

import Icon from '@components/common/Icon';
import { CustomTheme } from '@utils/colors';
import PrecipitationStrip from '../forecast/PrecipitationStrip';

type CollapsiblePanelHeaderProps = {
  open: boolean;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
  time?: string;
  smartSymbol?: ReactElement<SvgProps> | null;
  temperature?: string;
  precipitationDay: { precipitation: number; timestamp: number }[] | false;
};

const CollapsibleListHeader: React.FC<CollapsiblePanelHeaderProps> = ({
  accessibilityLabel,
  onPress,
  open,
  title,
  time,
  smartSymbol,
  temperature,
  precipitationDay,
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <TouchableOpacity
      activeOpacity={1}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}>
      <View
        style={[
          styles.row,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.inputBackground,
          },
        ]}>
        <View style={[styles.rowColumn, styles.alignStart]}>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            {title}
          </Text>
        </View>
        <View style={[precipitationDay && styles.middleContainer]}>
          <View style={styles.symbolsContainer}>
            {time && (
              <View style={styles.rowColumn}>
                <Text style={[styles.text, { color: colors.primaryText }]}>
                  {time}
                </Text>
              </View>
            )}
            {smartSymbol && <View style={styles.rowColumn}>{smartSymbol}</View>}
            {temperature && (
              <View style={styles.rowColumn}>
                <Text
                  style={[styles.temperature, { color: colors.primaryText }]}>
                  {temperature}
                </Text>
              </View>
            )}
          </View>
          {precipitationDay && (
            <PrecipitationStrip precipitationData={precipitationDay} />
          )}
        </View>
        <View
          style={[styles.iconContainer, { borderLeftColor: colors.border }]}>
          <Icon
            width={24}
            height={24}
            name={open ? 'arrow-up' : 'arrow-down'}
            style={{ color: colors.primaryText }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: 72,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  middleContainer: {
    flex: 5,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  temperature: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  rowColumn: {
    flex: 1,
    alignItems: 'center',
  },
  symbolsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    paddingLeft: 10,
    borderLeftWidth: 1,
    height: '100%',
    justifyContent: 'center',
  },
});

export default CollapsibleListHeader;

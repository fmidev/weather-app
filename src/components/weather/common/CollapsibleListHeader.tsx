import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from '@assets/Icon';
import { CustomTheme } from '@assets/colors';
import { toStringWithDecimal } from '@utils/number';
import PrecipitationStrip from '../forecast/PrecipitationStrip';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Config } from '@config';
import { selectUnits } from '@store/settings/selectors';
import {
  formatAccessiblePrecipitation,
  PrecipitationData,
} from '@utils/accessibility';

type CollapsiblePanelHeaderProps = {
  open: boolean;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
  maxTemp?: string;
  minTemp?: string;
  totalPrecipitation?: number;
  precipitationDay?: PrecipitationData;
};

const CollapsibleListHeader: React.FC<CollapsiblePanelHeaderProps> = ({
  accessibilityLabel,
  onPress,
  open,
  title,
  maxTemp,
  minTemp,
  totalPrecipitation,
  precipitationDay,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation();
  const units = useSelector(selectUnits);
  const precipitationUnit =
    units?.precipitation?.unitAbb ?? Config.get('settings').units.precipitation;
  const precipitationDescription = precipitationDay
    ? formatAccessiblePrecipitation(
        precipitationDay,
        precipitationUnit,
        i18n.language,
        t
      )
    : '';
  const headerDescription = [accessibilityLabel, precipitationDescription]
    .filter(Boolean)
    .join('. ');

  return (
    <TouchableOpacity
      activeOpacity={1}
      accessible
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={headerDescription}
      onPress={onPress}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
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
            {!!maxTemp && (
              <View style={styles.rowColumn}>
                <Icon
                  height={18}
                  width={18}
                  name={
                    dark
                      ? 'temperature-highest-dark'
                      : 'temperature-highest-light'
                  }
                  style={styles.withMarginRight}
                />
                <Text style={[styles.text, { color: colors.primaryText }]}>
                  {maxTemp}
                </Text>
              </View>
            )}
            {!!minTemp && (
              <View style={styles.rowColumn}>
                <Icon
                  height={18}
                  width={18}
                  name={
                    dark
                      ? 'temperature-lowest-dark'
                      : 'temperature-lowest-light'
                  }
                  style={styles.withMarginRight}
                />
                <Text style={[styles.text, { color: colors.primaryText }]}>
                  {minTemp}
                </Text>
              </View>
            )}
            {!Number.isNaN(totalPrecipitation) &&
              totalPrecipitation !== undefined && (
                <View style={styles.rowColumn}>
                  <Icon
                    height={18}
                    width={18}
                    name={dark ? 'rain-dark' : 'rain-white'}
                    style={styles.withMarginRight}
                  />
                  <Text style={[styles.text, { color: colors.primaryText }]}>
                    {toStringWithDecimal(totalPrecipitation, ',')}{' '}
                    <Text
                      style={[
                        styles.text,
                        styles.regular,
                        { color: colors.primaryText },
                      ]}>
                      mm
                    </Text>
                  </Text>
                </View>
              )}
          </View>
          {precipitationDay && (
            <PrecipitationStrip
              precipitationData={precipitationDay}
              accessible={false}
            />
          )}
        </View>
        <View
          style={[styles.iconContainer, { borderLeftColor: colors.border }]}>
          <View
            style={[
              styles.iconOutline,
              {
                backgroundColor: colors.inputButtonBackground,
              },
            ]}>
            <Icon
              width={24}
              height={24}
              name={open ? 'arrow-up' : 'arrow-down'}
              style={{ color: colors.primaryText }}
            />
          </View>
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
    fontFamily: BOLD_FONT,
    textTransform: 'capitalize',
  },
  text: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
  },
  regular: {
    fontFamily: REGULAR_FONT,
  },
  alignStart: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  rowColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  iconContainer: {
    paddingLeft: 10,
    borderLeftWidth: 1,
    height: '100%',
    justifyContent: 'center',
  },
  iconOutline: {
    width: 24,
    height: 24,
    borderRadius: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withMarginRight: {
    marginRight: 4,
  },
});

export default CollapsibleListHeader;

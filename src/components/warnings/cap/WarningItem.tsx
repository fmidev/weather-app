import React from 'react';
import { Text, View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@assets/Icon';
import { Config } from '@config';
import { CustomTheme, GRAYISH_BLUE } from '@assets/colors';
import { CapWarning, WarningType } from '@store/warnings/types';
import { selectCapInfoByLanguage } from '@utils/helpers';
import WarningSymbol from '../../../assets/WarningsSymbol';
import CapSeverityBar from './CapSeverityBar';

const MAX_AREA_COUNT_FOR_HIDE_LONG_AREA_LIST = 5;

type WarningItemProps = {
  areasDescription?: string;
  warning: CapWarning;
  warningCount?: number;
  scrollViewRef?: React.RefObject<ScrollView | null>;
  timespan: string;
  includeSeverityBars: boolean;
  dailySeverities?: number[][];
  open?: boolean;
  includeArrow: boolean | undefined;
  showDescription?: boolean;
  showAreas?: boolean;
};

const WarningItem: React.FC<WarningItemProps> = ({
  areasDescription,
  warning,
  warningCount,
  scrollViewRef,
  timespan,
  includeSeverityBars,
  dailySeverities,
  open,
  includeArrow,
  showDescription,
  showAreas = true,
}) => {
  const { width } = useWindowDimensions();
  const { capViewSettings } = Config.get('warnings');
  const { t, i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const info = Array.isArray(warning.info)
    ? selectCapInfoByLanguage(warning.info, i18n.language)
    : warning.info;
  const areaDesc = info.area.areaDesc
    .charAt(0)
    .toUpperCase()
    .concat(info.area.areaDesc.substring(1));

  const areaList = areasDescription || areaDesc;
  const areaCount = areaList.split(',').length;

  return (
    <View>
      <View
        style={[
          styles.headingContainer,
          showDescription && styles.noBorderBottom,
          {
            backgroundColor: colors.background,
          },
        ]}>
        <WarningSymbol
          type={info.event as WarningType}
          severity={info.severity}
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
              {dailySeverities?.map((daySeverities, index) => (
                <CapSeverityBar
                  key={`${index}-${daySeverities.toString()}`}
                  severities={daySeverities}
                />
              ))}
            </ScrollView>
          )}
          <Text style={[styles.headingTitle, { color: colors.hourListText }]}>
            {(info.event as WarningType) ? info.event : ''}
            {capViewSettings?.warningBlockWarningCountEnabled !== false &&
            warningCount &&
            warningCount > 1
              ? ` (${warningCount} pcs)`
              : ''}
          </Text>
          <Text style={[styles.headingText, { color: colors.hourListText }]}>
            {timespan}
          </Text>
          { showAreas && (
            <Text style={[styles.headingText, { color: colors.hourListText }]}>
              {capViewSettings?.hideLongArealist &&
              areaCount > MAX_AREA_COUNT_FOR_HIDE_LONG_AREA_LIST
                ? t('warnings:capInfo:areas', { count: areaCount })
                : areaList}
            </Text>
          )}
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
        <View
          style={[
            styles.warningDescription,
            { backgroundColor: colors.background },
          ]}>
          <Text style={{ color: colors.hourListText }}>{info.description}</Text>
        </View>
      )}
    </View>
  );
};

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
  noBorderBottom: {
    borderBottomWidth: 0,
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
  row: {
    flexDirection: 'row',
  },
  warningDescription: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: GRAYISH_BLUE,
  },
});

export default WarningItem;

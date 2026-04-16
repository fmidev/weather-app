import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import Text from '@components/common/AppText';
import { CustomTheme } from '@assets/colors';
import { ClockType } from '@store/settings/types';
import { CapWarning } from '@store/warnings/types';
import { severityList } from '@store/warnings/constants';
import WarningItem from './WarningItem';

type LocalWarningsDetailsProps = {
  warnings: CapWarning[];
  clockType: ClockType;
  locale: string;
};

const LocalWarningsDetails: React.FC<LocalWarningsDetailsProps> = ({
  warnings,
  clockType,
  locale,
}) => {
  const { t } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;

  const timeFormat = clockType === 12 ? 'h.mm a' : 'H:mm';
  const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';

  const warningTimeSpans = warnings.map((warning) => {
    const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
    const start = moment(info.effective);
    const end = moment(info.expires);
    const startFormatted = start
      .locale(locale)
      .format(`${weekdayAbbreviationFormat} ${dateFormat} ${timeFormat}`);

    const endFormatted = end
      .locale(locale)
      .format(
        start.isSame(end, 'day')
          ? timeFormat
          : `${weekdayAbbreviationFormat} ${dateFormat} ${timeFormat}`
      );
    return `${startFormatted} - ${endFormatted}`;
  });

  return (
    <>
      {warnings.length === 0 && (
        <Text style={[styles.description, { color: colors.hourListText }]}>
          {t('noWarningsText')}
        </Text>
      )}
      {warnings.map((warning, index) => {
        const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
        return (
          <View
            key={`${warning.identifier}-${info.area.areaDesc}`}
            accessible
            accessibilityLabel={`${info.event}, ${t(`warnings:severities:${severityList.indexOf(info.severity)}`)}, ${warningTimeSpans[index]}`}>
            <WarningItem
              warning={warning}
              includeArrow={false}
              includeSeverityBars={false}
              showDescription={false}
              showAreas={false}
              timespan={warningTimeSpans[index]}
            />
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  description: {
    fontFamily: 'Roboto',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

export default LocalWarningsDetails;

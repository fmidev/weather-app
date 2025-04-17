import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@assets/colors';
import { Warning } from '@store/warnings/types';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '@store/types';
import { selectClockType } from '@store/settings/selectors';
import WarningSymbol from './WarningsSymbol';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type DayDetailsProps = PropsFromRedux & {
  warnings: Warning[];
};

const DayDetails: React.FC<DayDetailsProps> = ({ clockType, warnings }) => {
  const { t, i18n } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;
  const [openWarnings, setOpenWarnings] = useState<{
    [index: number]: boolean;
  }>([]);

  const locale = i18n.language;
  const timeFormat = clockType === 12 ? 'h.mm a' : 'HH.mm';

  useEffect(() => {
    setOpenWarnings([]);
  }, [warnings, setOpenWarnings]);

  return (
    <View style={styles.container}>
      {warnings.length === 0 && (
        <View>
          <Text style={[styles.description, { color: colors.hourListText }]}>
            {t('warnings:noWarningsText')}
          </Text>
        </View>
      )}
      {warnings.map(({ description, type, severity, duration }, index) => (
        <View
          key={`${type}-${duration.startTime}-${duration.endTime}-${severity}`}>
          <View style={styles.flex}>
            <AccessibleTouchableOpacity
              accessibilityRole="button"
              accessibilityHint={
                openWarnings[index]
                  ? t('lessAccessibilityHint')
                  : t('moreAccessibilityHint')
              }
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
                  style={[styles.headerText, { color: colors.hourListText }]}
                  accessibilityLabel={`${t(`types.${type}`)} - ${t(
                    'valid'
                  )} ${moment(duration.startTime).format(
                    `DD MMMM ${timeFormat}`
                  )} - ${moment(duration.endTime).format(
                    `DD MMMM ${timeFormat}`
                  )}`}>
                  <Text style={styles.bold}>{`${t(`types.${type}`)}`}</Text>
                  {` – ${t('valid')} ${moment(duration.startTime).format(
                    locale === 'en'
                      ? `MMM D ${timeFormat}`
                      : `D.M. ${timeFormat}`
                  )} - ${moment(duration.endTime).format(
                    locale === 'en'
                      ? `MMM D ${timeFormat}`
                      : `D.M. ${timeFormat}`
                  )} `}
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
            </AccessibleTouchableOpacity>
          </View>
          {openWarnings[index] && (
            <View style={styles.body}>
              <Text
                style={[styles.description, { color: colors.hourListText }]}>
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
    alignItems: 'flex-start',
  },
});
export default connector(DayDetails);

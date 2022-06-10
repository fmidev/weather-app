import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@utils/colors';
import PanelHeader from '@components/weather/common/PanelHeader';
import { State } from '@store/types';
import {
  selectUpdated,
  selectDailyWarningData,
  selectWarningsAge,
} from '@store/warnings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';
import { Config } from '@config';
import SeverityBar from './SeverityBar';

const mapStateToProps = (state: State) => ({
  dailyWarnings: selectDailyWarningData(state),
  updated: selectUpdated(state),
  warningsAge: selectWarningsAge(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningsPanelSlimProps = PropsFromRedux & {};

const WarningsPanelSlim: React.FC<WarningsPanelSlimProps> = ({
  dailyWarnings,
  updated,
  warningsAge,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const navigation = useNavigation();
  const { ageWarning } = Config.get('warnings');
  if (!updated) {
    return null;
  }

  moment.locale(i18n.language);

  const lastUpdated = {
    time: moment(updated).format(`D.M. [${t('forecast:at')}] HH:mm`),
    ageCheck: warningsAge > (ageWarning ?? 120) * 60 * 1000,
  };

  const onPress = (index: number) => {
    navigation.navigate(
      'Warnings' as never,
      {
        screen: 'StackWarnings',
        params: { day: index },
      } as never
    );
  };

  return (
    <View
      style={[
        styles.cardWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
        },
      ]}>
      <PanelHeader
        title={`${t('warnings:panelTitleSlim')}`}
        lastUpdated={lastUpdated}
      />
      <View style={styles.cardContainer}>
        <View
          style={[
            styles.weekWarningsContainer,
            {
              borderColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.warningDaysContainer,
              {
                borderColor: colors.border,
              },
            ]}>
            {dailyWarnings.map(({ severity, date }, index) => (
              <AccessibleTouchableOpacity
                key={date}
                onPress={() => onPress(index)}
                accessibilityRole="button"
                accessibilityLabel={`${moment(date).format('dddd')}, ${
                  severity > 0
                    ? t('warnings:hasWarnings')
                    : t('warnings:noWarnings')
                }`}
                accessibilityHint={t('warnings:navigateToWarningsPage')}>
                <View
                  style={[
                    styles.warningsSingleDayContainer,
                    index === 0 && styles.startBorderRadius,
                    index === 4 && styles.endBorderRadius,
                    index < 4 && styles.withBorderRight,
                    {
                      borderRightColor: colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.cardText,
                      styles.dayWarningHeaderText,
                      {
                        color: colors.text,
                      },
                    ]}>
                    {moment(date).format('dd')}
                  </Text>
                  <SeverityBar severity={severity} />
                </View>
              </AccessibleTouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 3,
  },
  cardContainer: {
    paddingHorizontal: 12,
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  weekWarningsContainer: {
    borderWidth: 1,
    borderRadius: 4,
    height: 48,
    marginVertical: 8,
  },
  warningDaysContainer: {
    height: 48,
    flexDirection: 'row',
  },
  warningsSingleDayContainer: {
    height: '100%',
    minWidth: '20%',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startBorderRadius: {
    borderTopLeftRadius: 4,
  },
  endBorderRadius: {
    borderTopRightRadius: 4,
  },
  withBorderRight: {
    borderRightWidth: 1,
  },
  dayWarningHeaderText: {
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});

export default connector(WarningsPanelSlim);

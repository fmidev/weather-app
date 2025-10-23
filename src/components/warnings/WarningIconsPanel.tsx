import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme } from '@assets/colors';
import { State } from '@store/types';
import {
  selectDailyWarningData,
  selectError,
  selectLoading,
} from '@store/warnings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';
import WarningIcon from './WarningIcon';
import DayDetailsDescription from './DayDetailsDescription';
import { TabParamList } from '@navigators/types';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  dailyWarnings: selectDailyWarningData(state),
  loading: selectLoading(state),
  error: selectError(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningIconsPanelProps = PropsFromRedux & {
  gridLayout?: boolean;
};

const WarningIconsPanel: React.FC<WarningIconsPanelProps> = ({
  dailyWarnings,
  loading,
  error,
  gridLayout,
}) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation('warnings');
  const { colors, dark } = useTheme() as CustomTheme;
  const navigation = useNavigation<NavigationProp<TabParamList>>();

  moment.locale(i18n.language);
  const colorMode = dark ? 'dark' : 'light';

  if (loading) {
    return (
      <MotiView style={[styles.cardWrapper, styles.noPadding, {
        marginLeft: insets.left + 16,
        marginRight: insets.right + 16
      }]}>
        <Skeleton colorMode={colorMode} width={'100%'} height={160} radius={10} />
      </MotiView>
    );
  }

  if (error) {
    return (
      <View
        testID="warnings_panel"
        // eslint-disable-next-line react-native/no-inline-styles
        style={[styles.cardWrapper, styles.errorCard, {
          backgroundColor: colors.warningCard,
          marginLeft: insets.left + 16,
          marginRight: gridLayout ? 8 : insets.right + 16,
        }]}
      >
        <Text style={[styles.errorText, { color: colors.primaryText }]}>{t('loadingError')}</Text>
      </View>
    )
  }

  const openWarnings = () => {
    trackMatomoEvent('User action', 'Weather', 'Open warnings -page');
    navigation.navigate('Warnings');
  }

  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  return (
    <TouchableOpacity onPress={openWarnings}>
      <View
        testID="warnings_panel"
        // eslint-disable-next-line react-native/no-inline-styles
        style={[styles.cardWrapper, {
          backgroundColor: colors.warningCard,
          marginLeft: insets.left + 16,
          marginRight: gridLayout ? 8 : insets.right + 16,
        }]}
      >
        <View style={styles.cardContainer}>
          <View
            accessible
            accessibilityRole="header">
            <Text
              style={[
                styles.headerText,
                {
                  color: colors.primaryText,
                },
              ]}>
              {t('panelTitleSlim')}
            </Text>
            <DayDetailsDescription warnings={dailyWarnings[0].warnings} />
          </View>
          <View
            style={[
              styles.weekWarningsContainer,
              {
                borderColor: colors.warningCardBorder
              },
            ]}>
            <View
              style={[
                styles.warningDaysContainer,
                {
                  borderColor: colors.warningCardBorder,
                },
              ]}>
              {dailyWarnings.map(({ severity, type, date, count, warnings }, index) => (
                <View
                  key={date}
                  accessible
                  accessibilityLabel={`${moment(date).format('dddd DD MMMM')}, ${t('hasWarnings')}: ${count}${
                    count > 0 ? ', ' + warnings[0].description : ''
                  }`}
                >
                  {count > 0 && (
                    <View
                      accessibilityElementsHidden
                      style={[
                        styles.countBadge,
                        {
                          borderColor: colors.primaryText,
                          backgroundColor: colors.background,
                        },
                      ]}>
                      <Text
                        style={[styles.badgeText, { color: colors.primaryText }]}>
                        {count}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.warningsSingleDayContainer,
                      index === 0 && styles.startBorderRadius,
                      index === 4 && styles.endBorderRadius,
                      index < 4 && styles.withBorderRight,
                      {
                        borderRightColor: colors.warningCardBorder,
                      },
                    ]}>
                    <View style={[styles.activeBorder]} />
                    <Text
                      style={[
                        styles.cardText,
                        styles.medium,
                        styles.dayWarningHeaderText,
                        {
                          color: colors.primaryText,
                        },
                      ]}>
                      {moment(date).format(weekdayAbbreviationFormat)}
                    </Text>
                    <View style={styles.iconContainer}>
                      <WarningIcon
                        type={type}
                        severity={severity}
                        {...(type === 'wind' || type === 'seaWind' ? { physical: warnings[0].physical } : {})}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 16,
    height: 160,
  },
  errorCard : {
    padding: 16,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
  activeBorder: {
    height: 3,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  countBadge: {
    position: 'absolute',
    elevation: 5,
    zIndex: 5,
    flex: 1,
    right: 6,
    top: -14,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  badgeText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  cardContainer: {
    paddingVertical: 12,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  weekWarningsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 0,
    marginVertical: 12,
    height: 60,
  },
  warningDaysContainer: {
    borderBottomWidth: 0,
    flex: 1,
    flexDirection: 'row',
  },
  warningsSingleDayContainer: {
    flex: 1,
    minWidth: '20%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 65,
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
  iconContainer: {
    paddingTop: 6,
  }
});

export default connector(WarningIconsPanel);

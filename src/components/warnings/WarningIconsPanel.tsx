import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  findNodeHandle,
  type LayoutChangeEvent,
} from 'react-native';
import {
  useTheme,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAccessibilityLanguage } from '@utils/hooks';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { CustomTheme } from '@assets/colors';
import { State } from '@store/types';
import {
  selectDailyWarningData,
  selectError,
  selectLoading,
  selectUpdated,
} from '@store/warnings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';

import Text from '@components/common/AppText';
import Skeleton from '@components/common/Skeleton';
import WarningIcon from './WarningIcon';
import DayDetailsDescription from './DayDetailsDescription';
import { TabParamList } from '@navigators/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackMatomoEvent } from '@utils/matomo';
import { REGULAR_FONT, MEDIUM_FONT, BOLD_FONT } from '@assets/constants';

const mapStateToProps = (state: State) => ({
  dailyWarnings: selectDailyWarningData(state),
  loading: selectLoading(state),
  error: selectError(state),
  // The daily selector returns five days even before the first response.
  hasData: selectUpdated(state) !== null,
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
  hasData,
  gridLayout,
}) => {
  const accessibilityLanguage = useAccessibilityLanguage();
  const insets = useSafeAreaInsets();
  const marginRight = gridLayout ? 8 : insets.right + 16;
  const { t, i18n } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const [dayNodeHandles, setDayNodeHandles] = useState<Record<number, number>>(
    {}
  );

  const registerDay = useCallback((index: number, event: LayoutChangeEvent) => {
    if (Platform.OS !== 'android') return;
    const nodeHandle = findNodeHandle(event.currentTarget);
    if (nodeHandle == null) return;

    setDayNodeHandles((current) =>
      current[index] === nodeHandle
        ? current
        : { ...current, [index]: nodeHandle }
    );
  }, []);

  useEffect(() => {
    if (i18n.language !== moment.locale()) {
      moment.locale(i18n.language);
    }
  }, [i18n.language]);

  if (loading && !hasData) {
    return (
      <View
        style={[
          styles.cardWrapper,
          styles.noPadding,
          {
            marginLeft: insets.left + 16,
            marginRight: insets.right + 16,
          },
        ]}>
        <Skeleton width="100%" height={160} radius={10} />
      </View>
    );
  }

  if (error && !hasData) {
    return (
      <View
        testID="warnings_panel"

        style={[
          styles.cardWrapper,
          styles.errorCard,
          {
            backgroundColor: colors.warningCard,
            marginLeft: insets.left + 16,
            marginRight,
          },
        ]}>
        <Text style={[styles.errorText, { color: colors.primaryText }]}>
          {t('loadingError')}
        </Text>
      </View>
    );
  }

  const openWarnings = () => {
    trackMatomoEvent('User action', 'Weather', 'Open warnings -page');
    navigation.navigate('Warnings');
  };

  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  return (
    <TouchableOpacity
      accessible={false}
      focusable={false}
      importantForAccessibility="no"
      accessibilityLanguage={accessibilityLanguage}
      onPress={openWarnings}>
      <View
        testID="warnings_panel"

        style={[
          styles.cardWrapper,
          {
            backgroundColor: colors.warningCard,
            marginLeft: insets.left + 16,
            marginRight,
          },
        ]}>
        <View style={styles.cardContainer}>
          <AccessibleTouchableOpacity
            accessible
            style={styles.headerContainer}
            accessibilityState={{ busy: loading }}
            accessibilityRole="header"
            accessibilityLabel={`${t('panelTitleSlim')}, ${
              dailyWarnings[0].warnings[0]?.description ?? t('noWarningsText')
            }`}
            accessibilityHint={t('navigateToWarningsPage')}
            nextFocusForward={
              Platform.OS === 'android' ? dayNodeHandles[0] : undefined
            }
            onPress={openWarnings}>
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
          </AccessibleTouchableOpacity>
          <View
            style={[
              styles.weekWarningsContainer,
              {
                borderColor: colors.warningCardBorder,
              },
            ]}>
            <View
              style={[
                styles.warningDaysContainer,
                {
                  borderColor: colors.warningCardBorder,
                },
              ]}>
              {dailyWarnings.map(
                ({ severity, type, date, count, warnings }, index) => (
                  <AccessibleTouchableOpacity
                    key={date}
                    accessible
                    style={styles.dayButton}
                    accessibilityRole="button"
                    accessibilityHint={t('navigateToWarningsPage')}
                    nextFocusForward={
                      Platform.OS === 'android'
                        ? dayNodeHandles[index + 1]
                        : undefined
                    }
                    onLayout={(event) => registerDay(index, event)}
                    onPress={openWarnings}
                    accessibilityLabel={`${moment(date).format('dddd D. MMMM')}, ${t('hasWarnings')}: ${count}${
                      count > 0 ? ', ' + warnings[0].description : ''
                    }`}>
                    {count > 0 && (
                      <View
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        style={[
                          styles.countBadge,
                          {
                            borderColor: colors.primaryText,
                            backgroundColor: colors.background,
                          },
                        ]}>
                        <Text
                          maxFontSizeMultiplier={1.5}
                          style={[
                            styles.badgeText,
                            { color: colors.primaryText },
                          ]}>
                          {count}
                        </Text>
                      </View>
                    )}
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
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
                          maxScaleFactor={1.5}
                          type={type}
                          severity={severity}
                          {...(type === 'wind' || type === 'seaWind'
                            ? { physical: warnings[0].physical }
                            : {})}
                        />
                      </View>
                    </View>
                  </AccessibleTouchableOpacity>
                )
              )}
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
    paddingVertical: 8,
    minHeight: 160,
  },
  errorCard: {
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
    lineHeight: 14,
    fontFamily: BOLD_FONT,
  },
  medium: {
    fontFamily: MEDIUM_FONT,
  },
  cardContainer: {
    paddingVertical: 8,
  },
  headerContainer: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  dayButton: {
    flex: 1,
    alignItems: 'stretch',
  },
  cardText: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  errorText: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  weekWarningsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 0,
    marginVertical: 12,
  },
  warningDaysContainer: {
    borderBottomWidth: 0,
    flexDirection: 'row',
  },
  warningsSingleDayContainer: {
    minWidth: '20%',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 65,
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
  },
});

export default connector(WarningIconsPanel);

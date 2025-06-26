import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { useTheme, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

import { CustomTheme, GRAY_1 } from '@assets/colors';
import { State } from '@store/types';
import {
  selectDailyWarningData,
  selectLoading,
} from '@store/warnings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { selectCurrent } from '@store/location/selector';
import RBSheet from 'react-native-raw-bottom-sheet';
import SeverityBar from './SeverityBar';
import DayDetails from './DayDetails';
import InfoSheet from './InfoSheet';

const mapStateToProps = (state: State) => ({
  dailyWarnings: selectDailyWarningData(state),
  location: selectCurrent(state),
  loading: selectLoading(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningsPanelProps = PropsFromRedux & {};

const WarningsPanel: React.FC<WarningsPanelProps> = ({
  dailyWarnings,
  location,
  loading,
}) => {
  const { t, i18n } = useTranslation('warnings');
  const { colors, dark } = useTheme() as CustomTheme;
  const route: any = useRoute();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const infoSheetRef = useRef<RBSheet>(null);
  const headerRef = useRef<View>(null);
  const colorMode = dark ? 'dark' : 'light';

  moment.locale(i18n.language);

  useEffect(() => {
    setSelectedDay(route.params?.day || 0);
  }, [route.params?.day, setSelectedDay]);

  useFocusEffect(() => {
    if (headerRef && headerRef.current) {
      const reactTag = findNodeHandle(headerRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  });

  if (loading) {
    return (
      <MotiView style={{backgroundColor: colors.background}}>
        <View style={[styles.loading, styles.loadingFirst]}>
          <Skeleton colorMode={colorMode} width={'100%'} height={40} radius={10} />
        </View>
        <View style={styles.loading}>
          <Skeleton colorMode={colorMode} width={'100%'} height={65} radius={10} />
        </View>
        <View style={[styles.loading, styles.loadingLast, { borderColor: colors.border}]}>
          <Skeleton colorMode={colorMode} width={'100%'} height={20} radius={10} />
        </View>
      </MotiView>
    );
  }

  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  return (
    <View
      testID="warnings_panel"
      style={[
        styles.cardWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.cardContainer}>
        <View style={styles.flex}>
          <View style={styles.row}>
            <View style={[styles.iconPadding]}>
              <View style={styles.filler} />
            </View>
            <View
              ref={headerRef}
              style={[styles.flex, styles.alignItems]}
              accessible
              accessibilityRole="header">
              <Text
                style={[
                  styles.bold,
                  styles.headerText,
                  { color: colors.primaryText },
                ]}>
                {`${t('panelTitle')}, ${location.name}`}
              </Text>
            </View>
            <AccessibleTouchableOpacity
              testID="warnings_info_button"
              accessibilityLabel={t('infoAccessibilityLabel')}
              onPress={() => infoSheetRef.current.open()}>
              <View style={[styles.iconPadding]}>
                <Icon
                  name="info"
                  color={colors.primaryText}
                  height={24}
                  width={24}
                />
              </View>
            </AccessibleTouchableOpacity>
          </View>
        </View>
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
            {dailyWarnings.map(({ severity, date, count }, index) => (
              <View key={date}>
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
                <AccessibleTouchableOpacity
                  onPress={() => setSelectedDay(index)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === selectedDay }}
                  accessibilityLabel={`${moment(date).format(
                    'dddd DD MMMM'
                  )}, ${t('hasWarnings')}: ${count}`}
                  accessibilityHint={
                    index === selectedDay ? '' : t('dateOpenHint')
                  }>
                  <View
                    style={[
                      styles.warningsSingleDayContainer,
                      index === 0 && styles.startBorderRadius,
                      index === 4 && styles.endBorderRadius,
                      index < 4 && styles.withBorderRight,
                      {
                        backgroundColor:
                          index === selectedDay
                            ? colors.selectedDayBackground
                            : undefined,
                        borderRightColor: colors.border,
                      },
                    ]}>
                    <View
                      style={[
                        styles.activeBorder,
                        index === selectedDay && {
                          backgroundColor: colors.tabBarActive,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.cardText,
                        index === selectedDay ? styles.bold : styles.medium,
                        styles.dayWarningHeaderText,
                        {
                          color: colors.text,
                        },
                      ]}>
                      {moment(date).format(weekdayAbbreviationFormat)}
                    </Text>
                    <Text
                      style={[
                        styles.cardText,
                        index === selectedDay ? styles.bold : styles.medium,
                        styles.dayWarningHeaderText,
                        {
                          color: colors.text,
                        },
                      ]}>
                      {moment(date).format(locale === 'en' ? 'MMM D' : 'D.M.')}
                    </Text>
                    <SeverityBar severity={severity} />
                  </View>
                </AccessibleTouchableOpacity>
              </View>
            ))}
          </View>
          <DayDetails warnings={dailyWarnings[selectedDay].warnings} />
        </View>
      </View>
      <RBSheet
        ref={infoSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <InfoSheet onClose={() => infoSheetRef.current.close()} />
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 3,
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
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  badgeText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold'
  },
  flex: {
    flex: 1,
  },
  iconPadding: {
    paddingHorizontal: 15,
  },
  filler: {
    width: 24,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  headerText: {
    fontSize: 16,
  },
  alignItems: {
    alignItems: 'center',
  },
  weekWarningsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  warningDaysContainer: {
    borderBottomWidth: 1,
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
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggableIcon: {
    backgroundColor: GRAY_1,
    width: 65,
  },
  loading: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  loadingFirst: {
    paddingTop: 24,
  },
  loadingLast: {
    paddingBottom: 18,
    borderBottomWidth: 1,
    marginBottom: 26,
  },
});

export default connector(WarningsPanel);

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme, GRAY_1, RED } from '@utils/colors';
import { State } from '@store/types';
import {
  selectUpdated,
  selectDailyWarningData,
  selectWarningsAge,
} from '@store/warnings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';
import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { selectCurrent } from '@store/location/selector';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Config } from '@config';
import SeverityBar from './SeverityBar';
import DayDetails from './DayDetails';
import InfoSheet from './InfoSheet';

const mapStateToProps = (state: State) => ({
  dailyWarnings: selectDailyWarningData(state),
  updated: selectUpdated(state),
  location: selectCurrent(state),
  warningsAge: selectWarningsAge(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningsPanelProps = PropsFromRedux & {};

const WarningsPanel: React.FC<WarningsPanelProps> = ({
  dailyWarnings,
  updated,
  location,
  warningsAge,
}) => {
  const { t, i18n } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;
  const route: any = useRoute();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const { ageWarning } = Config.get('warnings');

  moment.locale(i18n.language);

  useEffect(() => {
    setSelectedDay(route.params?.day || 0);
  }, [route.params?.day, setSelectedDay]);

  if (!updated) {
    return null;
  }

  return (
    <View
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
              style={[styles.flex, styles.alignItems]}
              accessible
              accessibilityRole="header">
              <Text
                style={[
                  styles.headerText,
                  {
                    color: colors.primaryText,
                  },
                ]}>
                {t('panelTitle')}
              </Text>
              <Text
                style={[
                  styles.bold,
                  styles.headerText,
                  { color: colors.primaryText },
                ]}>
                {location.name}
              </Text>
            </View>
            <AccessibleTouchableOpacity
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
                  accessibilityHint={t('dateAccessibilityHint')}>
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
                      {moment(date).format('dd')}
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
                      {moment(date).format('DD.MM.')}
                    </Text>
                    <SeverityBar severity={severity} />
                  </View>
                </AccessibleTouchableOpacity>
              </View>
            ))}
          </View>
          <DayDetails warnings={dailyWarnings[selectedDay].warnings} />
        </View>
        <View style={[styles.row, styles.alignCenter]}>
          <Text
            style={[
              styles.updatedText,
              {
                color:
                  warningsAge > (ageWarning ?? 120) * 60 * 1000
                    ? RED
                    : colors.hourListText,
              },
            ]}>
            {t('lastUpdated')}{' '}
            <Text style={styles.bold}>
              {moment(updated).format(`DD.MM. [${t('forecast:at')}] HH:mm`)}
            </Text>
          </Text>
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
  },
  flex: {
    flex: 1,
  },
  iconPadding: {
    padding: 15,
  },
  filler: {
    width: 24,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  cardContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  alignCenter: {
    justifyContent: 'center',
  },
  alignItems: {
    alignItems: 'center',
  },
  weekWarningsContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 4,
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
  updatedText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
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
});

export default connector(WarningsPanel);

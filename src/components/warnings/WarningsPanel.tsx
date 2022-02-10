import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme } from '@utils/colors';
import { State } from '@store/types';
import {
  selectUpdated,
  selectDailyWarningData,
} from '@store/warnings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';
import Icon from '@components/common/Icon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { selectCurrent } from '@store/location/selector';
import SeverityBar from './SeverityBar';
import DayDetails from './DayDetails';

const mapStateToProps = (state: State) => ({
  dailyWarnings: selectDailyWarningData(state),
  updated: selectUpdated(state),
  location: selectCurrent(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningsPanelProps = PropsFromRedux & {};

const WarningsPanel: React.FC<WarningsPanelProps> = ({
  dailyWarnings,
  updated,
  location,
}) => {
  const { t, i18n } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;
  const route: any = useRoute();
  const [selectedDay, setSelectedDay] = useState<number>(0);

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
            <View style={[styles.flex, styles.alignItems]}>
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
            <View style={[styles.iconPadding]}>
              <TouchableOpacity onPress={() => {}}>
                <Icon
                  name="info"
                  color={colors.primaryText}
                  height={24}
                  width={24}
                />
              </TouchableOpacity>
            </View>
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
                <TouchableOpacity
                  style={styles.touchArea}
                  onPress={() => setSelectedDay(index)}>
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
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <DayDetails warnings={dailyWarnings[selectedDay].warnings} />
        </View>
        <View style={[styles.row, styles.alignCenter]}>
          <Text style={[styles.updatedText, { color: colors.secondaryText }]}>
            {t('lastUpdated')}{' '}
            <Text style={styles.bold}>
              {moment(updated).format(`DD.MM.YYYY [${t('forecast:at')}] HH:mm`)}
            </Text>
          </Text>
        </View>
      </View>
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
    height: 65,
    flex: 1,
    flexDirection: 'row',
  },
  warningsSingleDayContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  touchArea: {
    minWidth: '20%',
    height: '100%',
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
});

export default connector(WarningsPanel);

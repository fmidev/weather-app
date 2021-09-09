import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import { WHITE, GREEN, CustomTheme } from '@utils/colors';
import PanelHeader from './common/PanelHeader';

type WarningsPanelProps = {
  headers: string[];
  onNavigate: () => void;
};

// TODO: this is a placeholder

const WarningsPanel: React.FC<WarningsPanelProps> = ({
  headers,
  onNavigate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View
      style={[
        styles.cardWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.cardShadow,
        },
      ]}>
      <PanelHeader title="Varoitukset Maa-alueilla" />
      <View style={styles.cardContainer}>
        <View style={styles.row}>
          <Text style={[styles.cardText, { color: colors.primaryText }]}>
            Tämä on placeholder
          </Text>
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
            {headers &&
              headers.length > 0 &&
              headers.map((day, index) => (
                <View
                  key={day}
                  style={[
                    styles.warningsSingleDayContainer,
                    index === 0 && styles.startBorderRadius,
                    index === 4 && styles.endBorderRadius,
                    index < 4 && styles.withBorderRight,
                    {
                      backgroundColor:
                        index === 0 ? colors.selectedDayBackground : undefined,
                      borderRightColor: colors.border,
                    },
                  ]}>
                  <View>
                    <Text
                      style={[
                        styles.cardText,
                        index === 0 ? styles.bold : styles.medium,
                        styles.dayWarningHeaderText,
                        {
                          color: index === 0 ? WHITE : colors.text,
                        },
                      ]}>
                      {day.split(' ')[0]}
                    </Text>
                    <Text
                      style={[
                        styles.cardText,
                        index === 0 ? styles.bold : styles.medium,
                        styles.dayWarningHeaderText,
                        {
                          color: index === 0 ? WHITE : colors.text,
                        },
                      ]}>
                      {day.split(' ')[1]}
                    </Text>
                  </View>

                  <View
                    style={[styles.severityBar, { backgroundColor: GREEN }]}
                  />
                </View>
              ))}
          </View>
          <View style={[styles.row, styles.alignCenter]}>
            <Icon
              name="arrow-down"
              width={24}
              height={24}
              style={{ color: colors.text }}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.row, styles.alignStart]}>
            <Text
              style={[
                styles.headerTitle,
                styles.withMarginRight,
                { color: colors.primaryText },
              ]}>
              Katso koko Suomen varoitukset
            </Text>
            <Icon
              width={24}
              height={24}
              name="warnings-status-orange"
              style={{
                color: colors.warningsIconFill,
              }}
            />
          </View>
          <TouchableOpacity onPress={onNavigate}>
            <Icon
              width={24}
              height={24}
              name="arrow-forward"
              style={{ color: colors.text }}
            />
          </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
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
  alignStart: {
    justifyContent: 'flex-start',
  },
  alignCenter: {
    justifyContent: 'center',
  },
  withMarginRight: {
    marginRight: 9,
  },
  weekWarningsContainer: {
    borderWidth: 1,
    borderRadius: 4,
    height: 100,
    marginVertical: 12,
  },
  warningDaysContainer: {
    borderBottomWidth: 1,
    height: 60,
    flexDirection: 'row',
  },
  warningsSingleDayContainer: {
    height: '100%',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
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
  severityBar: {
    height: 6,
    borderWidth: 1,
    backgroundColor: GREEN,
  },
});

export default WarningsPanel;

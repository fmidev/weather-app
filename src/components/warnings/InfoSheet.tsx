import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import CloseButton from '@components/common/CloseButton';

import { CustomTheme, GREEN, ORANGE, RED, YELLOW } from '@assets/colors';
import useOrientation from '@utils/hooks';
import { WarningType } from '@store/warnings/types';
import { knownWarningTypes } from '@store/warnings/constants';
import SeverityBar from './SeverityBar';
import WarningSymbol from './WarningsSymbol';
import TypeColorRow from './TypeColorRow';

type InfoSheetProps = {
  onClose: () => void;
};

const InfoSheet: React.FC<InfoSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;
  const isLandscape = useOrientation();
  const severities = [0, 1, 2, 3];
  const severityColors = [GREEN, YELLOW, ORANGE, RED];

  const SeverityBarRow = ({ severity }: { severity: number }) => (
    <View style={styles.row}>
      <View style={[styles.iconWrapper, styles.severity]}>
        <SeverityBar severity={severity} />
      </View>
      <Text style={[styles.text, { color: colors.hourListText }]}>
        {t(`warnings:severities:${severity}`).toLocaleLowerCase()}
      </Text>
    </View>
  );

  const TypeRow = ({ type }: { type: WarningType }) => (
    <View style={styles.row}>
      <View style={[styles.iconWrapper]}>
        <WarningSymbol type={type} severity="Moderate" />
      </View>
      <Text style={[styles.text, { color: colors.hourListText }]}>
        {t(`warnings:types:${type}`).toLocaleLowerCase()}
      </Text>
    </View>
  );

  return (
    <View testID="warnings_info_bottom_sheet" style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            testID="warnings_info_bottom_sheet_close_button"
            onPress={onClose}
            accessibilityLabel={t(
              'map:infoBottomSheet:closeAccessibilityLabel'
            )}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isLandscape && styles.landscape}>
          <TouchableOpacity activeOpacity={1} accessible={false}>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('warnings:info:dailyTitle')}
              </Text>
            </View>
            <View
              style={[
                styles.rowWrapper,
                styles.withBorderBottom,
                { borderBottomColor: colors.border },
              ]}>
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <View
                    accessibilityElementsHidden
                    style={[
                      styles.ball,
                      {
                        borderColor: colors.primaryText,
                        backgroundColor: colors.background,
                      },
                    ]}>
                    <Text
                      style={[styles.badgeText, { color: colors.primaryText }]}>
                      2
                    </Text>
                  </View>
                </View>

                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('warnings:info:dailyBadge')}
                </Text>
              </View>
              {severities.map((severity) => (
                <SeverityBarRow key={severity} severity={severity} />
              ))}
            </View>

            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('warnings:info:mapTitle')}
              </Text>
            </View>
            <View
              style={[
                styles.rowWrapper,
                styles.withBorderBottom,
                { borderBottomColor: colors.border },
              ]}>
              {knownWarningTypes.map((type) => (
                <TypeRow key={type} type={type} />
              ))}
              {severities.map((severity) => (
                <TypeColorRow
                  key={severity}
                  severity={severity}
                  severityColors={severityColors}
                />
              ))}
            </View>

            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('warnings:info:timezone')}
              </Text>
            </View>
            <View
              style={[styles.rowWrapper, { borderBottomColor: colors.border }]}>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('warnings:info:timezoneText')}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rowWrapper: {
    paddingBottom: 28,
    paddingTop: 15,
    marginBottom: 14,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  landscape: {
    paddingBottom: 200,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrapper: {
    minWidth: 40,
  },
  severity: {
    paddingRight: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flex: 2,
    flexWrap: 'wrap',
  },
  ball: {
    position: 'absolute',
    elevation: 5,
    zIndex: 5,
    flex: 1,
    right: 16,
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
});

export default InfoSheet;

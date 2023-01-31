/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import CloseButton from '@components/common/CloseButton';
import {
  CustomTheme,
  GRAYISH_BLUE,
  WHITE,
  CAP_WARNING_NEUTRAL,
  CAP_WARNING_YELLOW,
  CAP_WARNING_ORANGE,
  CAP_WARNING_RED,
} from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { t } from 'i18next';
import CapSeverityBar from './CapSeverityBar';
import TypeColorRow from '../TypeColorRow';

const CapWarningsLegend = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme() as CustomTheme;
  const severityColors = [
    CAP_WARNING_NEUTRAL,
    CAP_WARNING_YELLOW,
    CAP_WARNING_ORANGE,
    CAP_WARNING_RED,
  ];
  return (
    <View style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <CloseButton onPress={onClose} accessibilityLabel="Sulje" />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={1} accessible={false}>
          <View style={[styles.contentContainer, styles.borderBottom]}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              {t('warnings:capInfo:dailyTitle')}
            </Text>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[0, 0, 0, 0]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                {t('warnings:severities:0')}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[1, 1, 1, 1]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                {t('warnings:severities:1')}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[2, 2, 2, 2]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                {t('warnings:severities:2')}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[3, 3, 3, 3]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                {t('warnings:severities:3')}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.hourListText }}>
                {t('warnings:capInfo:example')}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[0, 0, 1, 1]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                {t('warnings:capInfo:example1Text')}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[1, 1, 2, 3]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                {t('warnings:capInfo:example2Text')}
              </Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              {t('warnings:capInfo:warningExplanationsOnLand')}
            </Text>
            <Text style={{ color: colors.hourListText }}>
              // TODO: add warning symbols{' '}
            </Text>
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              {t('warnings:capInfo:warningExplanationsAtSea')}
            </Text>
            <Text style={{ color: colors.hourListText }}>
              // TODO: add warning symbols
            </Text>
          </View>
          <View style={[styles.contentContainer, styles.borderBottom]}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              {t('warnings:capInfo:warningColorsExplanation')}
            </Text>
            <View>
              <TypeColorRow severity={0} severityColors={severityColors} />
            </View>
            <View>
              <TypeColorRow severity={1} severityColors={severityColors} />
            </View>
            <View>
              <TypeColorRow severity={2} severityColors={severityColors} />
            </View>
            <View>
              <TypeColorRow severity={3} severityColors={severityColors} />
            </View>
          </View>
          <View style={[styles.contentContainer]}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              {t('warnings:capInfo:timezone')}
            </Text>
            <Text style={{ color: colors.hourListText }}>
              {t('warnings:capInfo:timezoneText')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    flex: 1,
  },
  contentContainer: {
    marginHorizontal: 20,
    paddingBottom: 24,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: GRAYISH_BLUE,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomColor: GRAYISH_BLUE,
    borderBottomWidth: 1,
    marginTop: -20,
  },
  legendRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headingText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    marginVertical: 25,
  },
  severityBarLegendText: {
    marginLeft: 14,
    flexWrap: 'wrap',
  },
});

export default CapWarningsLegend;

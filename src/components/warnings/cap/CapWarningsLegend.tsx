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
              Aikajana – vuorokausikohtaiset selitykset
            </Text>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[0, 0, 0, 0]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                ei vaaraa
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[1, 1, 1, 1]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                mahdollisesti vaarallinen
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[2, 2, 2, 2]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                vaarallinen
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[3, 3, 3, 3]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                hyvin vaarallinen
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.hourListText }}>esimerkki</Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[0, 0, 1, 1]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                mahdollisesti vaarallinen sää vuorokauden jälkipuoliskolla
              </Text>
            </View>
            <View style={styles.legendRow}>
              <CapSeverityBar severities={[1, 1, 2, 3]} />
              <Text
                style={[
                  styles.severityBarLegendText,
                  { color: colors.hourListText },
                ]}>
                sää kehittyy mahdollisesti vaarallisesta hyvin vaaralliseen
                vuorokauden edetessä
              </Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              Varoitusten selitykset maa-alueilla
            </Text>
            <Text style={{ color: colors.hourListText }}>
              // TODO: add warning symbols
            </Text>
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              Varoitusten selitykset merialueilla
            </Text>
            <Text style={{ color: colors.hourListText }}>
              // TODO: add warning symbols
            </Text>
          </View>
          <View style={[styles.contentContainer, styles.borderBottom]}>
            <Text style={[styles.headingText, { color: colors.primaryText }]}>
              Varoitusvärien selitykset
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
              Aikavyöhyke
            </Text>
            <Text style={{ color: colors.hourListText }}>
              Kaikki sovelluksen kellonakat esitetään valitun aikavyöhykkeen
              sijainnin ajan mukaan.
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
  },
});

export default CapWarningsLegend;

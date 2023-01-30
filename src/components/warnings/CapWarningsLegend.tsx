import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import CloseButton from '@components/common/CloseButton';
import { CustomTheme, GRAYISH_BLUE, WHITE } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import CapSeverityBar from './CapSeverityBar';

const CapWarningsLegend = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <CloseButton onPress={onClose} accessibilityLabel="Sulje" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.headingText, { color: colors.primaryText }]}>
          Aikajana – vuorokausikohtaiset selitykset
        </Text>
        <View style={styles.legendRow}>
          <CapSeverityBar severities={[0, 0, 0, 0]} />
          <Text>ei vaaraa</Text>
        </View>
        <View style={styles.legendRow}>
          <CapSeverityBar severities={[1, 1, 1, 1]} />
          <Text>mahdollisesti vaarallinen</Text>
        </View>
        <View style={styles.legendRow}>
          <CapSeverityBar severities={[2, 2, 2, 2]} />
          <Text>vaarallinen</Text>
        </View>
        <View style={styles.legendRow}>
          <CapSeverityBar severities={[3, 3, 3, 3]} />
          <Text>hyvin vaarallinen</Text>
        </View>
        <View>
          <Text>esimerkki</Text>
        </View>
        <View style={styles.legendRow}>
          <CapSeverityBar severities={[0, 0, 1, 1]} />
          <Text>
            mahdollisesti vaarallinen sää vuorokauden jälkipuoliskolla
          </Text>
        </View>
        <View style={styles.legendRow}>
          <CapSeverityBar severities={[1, 1, 2, 3]} />
          <Text>
            sää kehittyy mahdollisesti vaarallisesta hyvin vaaralliseen
            vuorokauden edetessä
          </Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.headingText, { color: colors.primaryText }]}>
          Varoitusten selitykset maa-alueilla
        </Text>
        <Text>Lorem ipsum dolor sit amet...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
  },
  contentContainer: {
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: GRAYISH_BLUE,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomColor: GRAYISH_BLUE,
    borderBottomWidth: 1,
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
});

export default CapWarningsLegend;

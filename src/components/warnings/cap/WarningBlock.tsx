import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { WarningType, Severity } from '@store/warnings/types';
import { CustomTheme, GRAYISH_BLUE } from '@utils/colors';
import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Icon from '@components/common/Icon';
import WarningSymbol from '../WarningsSymbol';
import CapSeverityBar from './CapSeverityBar';

function WarningBlock({
  title,
  text,
  warningSymbolType,
  severity,
}: {
  title: string;
  text: string;
  warningSymbolType: WarningType;
  severity: Severity;
}) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme() as CustomTheme;
  return (
    <View>
      <AccessibleTouchableOpacity onPress={() => setOpen(!open)}>
        <View
          style={[
            styles.headingContainer,
            { backgroundColor: colors.background },
          ]}>
          <WarningSymbol
            type={warningSymbolType}
            severity={severity}
            size={32}
          />
          <View style={styles.headingMainContent}>
            <View style={[styles.row, styles.severityBarContainer]}>
              <CapSeverityBar severities={[0, 0, 0, 0]} />
              <CapSeverityBar severities={[0, 0, 1, 1]} />
              <CapSeverityBar severities={[2, 2, 3, 2]} />
              <CapSeverityBar severities={[0, 1, 2, 3]} />
              <CapSeverityBar severities={[0, 1, 2, 3]} />
            </View>
            <Text style={[styles.headingTitle, { color: colors.hourListText }]}>
              {title}
            </Text>
            <Text style={[styles.headingText, { color: colors.hourListText }]}>
              {text}
            </Text>
          </View>
          <View style={styles.accordionArrow}>
            <Icon
              name={open ? 'arrow-up' : 'arrow-down'}
              height={24}
              color={colors.primaryText}
            />
          </View>
        </View>
      </AccessibleTouchableOpacity>
      {open && (
        <View
          style={[
            styles.openableContent,
            { backgroundColor: colors.accordionContentBackground },
          ]}>
          <View style={[styles.row]}>
            <WarningSymbol
              type={warningSymbolType}
              severity={severity}
              size={32}
            />
            <View style={styles.accordionContentHeading}>
              <Text
                style={[styles.headingTitle, { color: colors.hourListText }]}>
                Test
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: GRAYISH_BLUE,
    paddingLeft: 16,
    width: '100%',
  },
  severityBarContainer: {
    marginBottom: 12,
  },
  accordionContentHeading: {
    flexDirection: 'column',
    marginVertical: 15,
    marginLeft: 16,
  },
  accordionArrow: {
    padding: 10,
    marginRight: 14,
  },
  headingMainContent: {
    flexDirection: 'column',
    marginVertical: 15,
    marginLeft: 16,
    flexGrow: 1,
  },
  headingTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
  },
  headingText: {
    fontSize: 16,
  },
  openableContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
  },
});

export default WarningBlock;

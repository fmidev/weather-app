import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { WarningType, Severity } from '@store/warnings/types';
import { CustomTheme, GRAYISH_BLUE } from '@utils/colors';
import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Icon from '@components/common/Icon';
import WarningSymbol from '../WarningsSymbol';
import CapSeverityBar from './CapSeverityBar';

function WarningBlock({
  title,
  text,
  warningSymbolType,
  severity,
  xOffset,
}: {
  title: string;
  text: string;
  warningSymbolType: WarningType;
  severity: Severity;
  xOffset?: number;
}) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme() as CustomTheme;
  const scrollViewRef = useRef() as React.MutableRefObject<ScrollView>;
  const { width } = useWindowDimensions();

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: xOffset ?? 0,
      y: 0,
      animated: true,
    });
  }, [xOffset]);

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
          <View style={[styles.headingMainContent, { width: width - 136 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              style={[
                styles.row,
                styles.severityBarContainer,
                { width: width - 136 },
              ]}
              ref={scrollViewRef}>
              <CapSeverityBar severities={[0, 0, 0, 0]} />
              <CapSeverityBar severities={[0, 0, 1, 1]} />
              <CapSeverityBar severities={[2, 2, 3, 2]} />
              <CapSeverityBar severities={[0, 1, 2, 3]} />
              <CapSeverityBar severities={[0, 1, 2, 3]} />
              <CapSeverityBar severities={[0, 1, 2, 3]} />
              <CapSeverityBar severities={[0, 1, 2, 3]} />
            </ScrollView>
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
              width={24}
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
    borderBottomWidth: 1,
    borderColor: GRAYISH_BLUE,
    paddingLeft: 16,
    width: '100%',
    flexGrow: 0,
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

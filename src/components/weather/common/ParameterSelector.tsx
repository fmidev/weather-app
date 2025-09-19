import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import {
  WHITE,
  WHITE_TRANSPARENT,
  GRAY_6,
  GRAY_6_TRANSPARENT,
  CustomTheme,
} from '@assets/colors';
import { ChartType } from '../charts/types';
import { trackMatomoEvent } from '@utils/matomo';

type ParameterSelectorProps = {
  chartTypes: ChartType[];
  parameter: ChartType;
  setParameter: (chartType: ChartType) => void;
};

const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  chartTypes,
  parameter,
  setParameter,
}) => {
  const [firstVisible, setFirstVisible] = useState<boolean>(true);
  const [lastVisible, setLastVisible] = useState<boolean>(true);
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const buttonList = useRef() as React.MutableRefObject<FlatList<ChartType>>;

  useEffect(() => {
    if (chartTypes && parameter && buttonList.current) {
      const i = chartTypes.findIndex((p) => p === parameter);
      if (i === 0) {
        buttonList.current.scrollToOffset({
          offset: 1,
          animated: true,
        });
      }
      if (i > 0) {
        buttonList.current.scrollToIndex({
          index: i,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }, [chartTypes, parameter]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
      contentOffset: { x },
      layoutMeasurement: { width },
      contentSize: { width: contentWidth },
    } = e.nativeEvent;

    if (contentWidth > width) {
      if (x < 20) {
        setFirstVisible(true);
      }
      if (x > 20) {
        setFirstVisible(false);
      }
      if (x + 20 < contentWidth - width) {
        setLastVisible(false);
      }
      if (x + 20 > contentWidth - width) {
        setLastVisible(true);
      }
    }
  };

  const rowRenderer = ({ item, index }: { item: ChartType; index: number }) => (
    <AccessibleTouchableOpacity
      activeOpacity={1}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: parameter === item }}
      accessibilityLabel={`${t('weather:parameter')}: ${t(
        `weather:charts:${item}`
      )}`}
      onPress={() => {
        trackMatomoEvent('User action', 'Weather', 'Selected OBSERVATIONS parameter');
        setParameter(item);
      }}
      style={index < chartTypes.length && styles.withMarginRight}>
      <View
        style={[
          styles.contentSelectionContainer,
          {
            backgroundColor:
              parameter === item
                ? colors.timeStepBackground
                : colors.inputButtonBackground,
            borderColor:
              parameter === item
                ? colors.chartSecondaryLine
                : colors.secondaryBorder,
          },
        ]}>
        <Text
          style={[
            styles.text,
            parameter === item && styles.medium,
            parameter === item && styles.selectedText,
            {
              color:
                parameter === item ? colors.primaryText : colors.hourListText,
            },
          ]}>
          {t(`weather:charts:${item}`)}
        </Text>
      </View>
    </AccessibleTouchableOpacity>
  );

  return (
    <View>
      <View style={styles.wrapper}>
        <FlatList
          ref={buttonList}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={chartTypes}
          onScroll={handleScroll}
          onScrollToIndexFailed={() => {}}
          renderItem={rowRenderer}
          keyExtractor={(chartType) => `chart-${chartType}`}
          contentContainerStyle={styles.listContentContainer}
          scrollEnabled={!(firstVisible && lastVisible)}
        />
        {!firstVisible && (
          <LinearGradient
            pointerEvents="none"
            style={[styles.gradient, styles.gradientLeft]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={
              dark ? [GRAY_6, GRAY_6_TRANSPARENT] : [WHITE, WHITE_TRANSPARENT]
            }
          />
        )}
        {!lastVisible && (
          <LinearGradient
            pointerEvents="none"
            style={[styles.gradient, styles.gradientRight]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={
              dark ? [GRAY_6_TRANSPARENT, GRAY_6] : [WHITE_TRANSPARENT, WHITE]
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 14,
  },
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  withMarginRight: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  selectedText: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  gradient: {
    position: 'absolute',
    width: 32,
    height: 44,
    zIndex: 5,
  },
  gradientLeft: {
    left: 0,
  },
  gradientRight: {
    right: 0,
  },
});

export default ParameterSelector;

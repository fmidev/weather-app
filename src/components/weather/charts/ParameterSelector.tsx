import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';

import {
  WHITE,
  WHITE_TRANSPARENT,
  GRAY_6,
  GRAY_6_TRANSPARENT,
  CustomTheme,
} from '@utils/colors';
import { ChartType } from './types';

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
  const [currentOffset, setCurrentOffset] = useState<number>(0);
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
    setCurrentOffset(x);
    if (contentWidth > width) {
      if (x < 15) {
        setFirstVisible(true);
      }
      if (x > 15) {
        setFirstVisible(false);
      }
      if (x + 15 < contentWidth - width) {
        setLastVisible(false);
      }
      if (x + 15 > contentWidth - width) {
        setLastVisible(true);
      }
    }
  };

  const scrollBackward = () => {
    let offset = currentOffset - 200;
    if (currentOffset - 200 < 0) offset = 0;
    buttonList.current.scrollToOffset({ offset, animated: true });
  };

  const scrollForward = () => {
    const offset = currentOffset + 200;
    buttonList.current.scrollToOffset({ offset, animated: true });
  };
  const rowRenderer = ({ item, index }: { item: ChartType; index: number }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        setParameter(item);
      }}
      style={[
        styles.contentSelectionContainer,
        index < chartTypes.length && styles.withMarginRight,
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
          {
            color:
              parameter === item ? colors.primaryText : colors.hourListText,
          },
        ]}>
        {t(`weather:charts:${item}`)}
      </Text>
    </TouchableOpacity>
  );

  return (
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
        <View
          style={[
            styles.scrollButton,
            styles.scrollButtonLeft,
            { backgroundColor: colors.background },
          ]}>
          <View
            style={[
              styles.separator,
              styles.separatorLeft,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
          <TouchableOpacity onPress={scrollBackward}>
            <Icon name="arrow-left" color={colors.text} />
          </TouchableOpacity>

          <LinearGradient
            style={[styles.gradient, styles.gradientLeft]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={
              dark ? [GRAY_6, GRAY_6_TRANSPARENT] : [WHITE, WHITE_TRANSPARENT]
            }
          />
        </View>
      )}
      {!lastVisible && (
        <View
          style={[
            styles.scrollButton,
            styles.scrollButtonRight,
            { backgroundColor: colors.background },
          ]}>
          <TouchableOpacity onPress={scrollForward}>
            <Icon name="arrow-right" color={colors.text} />
          </TouchableOpacity>
          <View
            style={[
              styles.separator,
              styles.separatorRight,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
          <LinearGradient
            style={[styles.gradient, styles.gradientRight]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={
              dark ? [GRAY_6_TRANSPARENT, GRAY_6] : [WHITE_TRANSPARENT, WHITE]
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: -10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 10,
  },
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  withMarginRight: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
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
    left: 44,
  },
  gradientRight: {
    right: 44,
  },
  scrollButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    padding: 10,
    justifyContent: 'center',
  },
  scrollButtonLeft: {
    left: 0,
  },
  scrollButtonRight: {
    right: 0,
  },
  separator: {
    position: 'absolute',
    width: 1,
    height: 28,
    zIndex: 4,
  },
  separatorLeft: {
    left: 43,
  },
  separatorRight: {
    right: 43,
  },
});

export default ParameterSelector;

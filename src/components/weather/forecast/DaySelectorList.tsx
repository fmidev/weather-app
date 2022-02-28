import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  VirtualizedList,
} from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme } from '@utils/colors';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import PrecipitationStrip from './PrecipitationStrip';

type DaySelectorListProps = {
  activeDayIndex: number;
  setActiveDayIndex: (i: number) => void;
  dayData: {
    maxTemperature: number;
    minTemperature: number;
    totalPrecipitation: number;
    timeStamp: number;
    smartSymbol: number | undefined;
    precipitationData: {
      precipitation: number | undefined;
      timestamp: number;
    }[];
  }[];
};

const DaySelectorList: React.FC<DaySelectorListProps> = ({
  activeDayIndex,
  setActiveDayIndex,
  dayData,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const dayStripRef = useRef() as React.MutableRefObject<
    VirtualizedList<{
      maxTemperature: number;
      minTemperature: number;
      totalPrecipitation: number;
      timeStamp: number;
      smartSymbol: number;
      precipitationData: {
        precipitation: number;
        timestamp: number;
      }[];
    }>
  >;

  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  useEffect(() => {
    if (activeDayIndex >= 0 && dayData && dayData.length) {
      dayStripRef.current.scrollToIndex({
        index: activeDayIndex,
        animated: true,
      });
    }
  }, [activeDayIndex, dayData]);

  const colRenderer = ({
    item,
    index,
  }: {
    item: {
      timeStamp: number;
      maxTemperature: number;
      minTemperature: number;
      smartSymbol: number;
      precipitationData: {
        precipitation: number;
        timestamp: number;
      }[];
    };
    index: number;
  }) => {
    const { timeStamp, maxTemperature, minTemperature, smartSymbol } = item;
    const stepMoment = moment.unix(timeStamp);
    const maxTemperaturePrefix = maxTemperature > 0 ? '+' : '';
    const minTemperaturePrefix = minTemperature > 0 ? '+' : '';
    const daySmartSymbol = weatherSymbolGetter(
      (smartSymbol || 0).toString(),
      dark
    );
    const isActive = index === activeDayIndex;

    return (
      <View
        style={[
          styles.dayBlock,
          isActive ? styles.activeBlock : undefined,
          index === 0 ? styles.leftBlock : undefined,
          index < dayData.length - 1 ? styles.noBorderRight : undefined,
          index === dayData.length - 1 ? styles.rightBlock : undefined,
          {
            backgroundColor: isActive ? colors.screenBackground : undefined,
            borderColor: colors.border,
            borderTopColor: isActive ? colors.tabBarActive : colors.border,
          },
        ]}>
        <TouchableOpacity
          onPress={() => setActiveDayIndex(index)}
          style={styles.alignCenter}>
          <Text
            style={[
              styles.forecastText,
              {
                color: colors.primaryText,
              },
            ]}>
            {stepMoment.locale(locale).format('ddd')}{' '}
            <Text style={[styles.bold, { color: colors.primaryText }]}>
              {stepMoment.locale(locale).format('D.M.')}
            </Text>
          </Text>
          <View style={styles.alignCenter}>
            {daySmartSymbol?.({
              width: 40,
              height: 40,
            })}
          </View>
          {activeParameters.includes('temperature') && (
            <Text
              style={[
                styles.forecastText,
                { color: colors.primaryText },
              ]}>{`${minTemperaturePrefix}${minTemperature}° ... ${maxTemperaturePrefix}${maxTemperature}°`}</Text>
          )}
        </TouchableOpacity>
        {activeParameters.includes('precipitation1h') && (
          <PrecipitationStrip
            precipitationData={item.precipitationData}
            style={styles.precipitationStrip}
          />
        )}
      </View>
    );
  };

  return (
    <VirtualizedList
      listKey="dayStrip"
      ref={dayStripRef}
      style={styles.list}
      contentContainerStyle={styles.listContentContainer}
      data={dayData}
      horizontal
      renderItem={colRenderer}
      keyExtractor={({ timeStamp }) => timeStamp.toString()}
      showsHorizontalScrollIndicator={false}
      onScrollToIndexFailed={({ index }) => {
        console.warn(`scroll to index: ${index} failed`);
      }}
      getItemCount={(items) => items && items.length}
      getItem={(items, index) => items[index]}
      getItemLayout={(_, index: number) => ({
        length: 80,
        offset: index * 80,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 100,
  },
  listContentContainer: {
    paddingRight: 8,
  },
  dayBlock: {
    minWidth: 80,
    borderWidth: 1,
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  noBorderRight: {
    borderRightWidth: 0,
  },
  activeBlock: {
    borderTopWidth: 3,
    paddingTop: 8,
  },
  leftBlock: {
    borderTopLeftRadius: 4,
  },
  rightBlock: {
    borderTopRightRadius: 4,
  },
  alignCenter: {
    alignItems: 'center',
  },
  forecastText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  precipitationStrip: {
    marginBottom: -10,
    marginHorizontal: -10,
    marginTop: 4,
  },
});

export default DaySelectorList;

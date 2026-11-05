import React, { memo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import moment from 'moment';
import HorizontalScrollFades from '@components/common/HorizontalScrollFades';
import { useHorizontalScrollEdges } from '@utils/hooks';

import { State } from '@store/types';
import { TimeStepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { selectUnits, selectClockType } from '@store/settings/selectors';

import { DAY_LENGTH } from '@store/forecast/constants';
import { Config } from '@config';
import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';
import DayDurationRow from './DayDurationRow';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type HourlyForecastProps = PropsFromRedux & {
  data: TimeStepData[];
  initialScrollHour?: number;
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  displayParams,
  clockType,
  units,
  initialScrollHour,
}) => {
  const { fontScale } = useWindowDimensions();
  const { excludeDayLength } = Config.get('weather').forecast;

  const initialScrollIndex =
    initialScrollHour === undefined || !data?.length
      ? -1
      : data.findIndex(({ localtime }) => {
          const localMoment = moment(localtime, moment.ISO_8601, true);
          return (
            localMoment.isValid() && localMoment.hour() === initialScrollHour
          );
        });
  const hourColumnWidth = Math.min(fontScale * 48, 62);
  const { scrollEdges, updateScrollEdges } = useHorizontalScrollEdges(
    Math.max(0, initialScrollIndex) * hourColumnWidth
  );

  if (!data || data.length === 0) return null;

  return (
    <>
      <View style={styles.row}>
        <ForecastListHeaderColumn
          displayParams={displayParams}
          units={units}
          compact
        />
        <View style={styles.listContainer}>
          <FlatList
            testID="hourly-forecast-list"
            onLayout={({ nativeEvent }) =>
              updateScrollEdges({ width: nativeEvent.layout.width })
            }
            onContentSizeChange={(contentWidth) =>
              updateScrollEdges({ contentWidth })
            }
            onScroll={({ nativeEvent }) =>
              updateScrollEdges({
                width: nativeEvent.layoutMeasurement.width,
                contentWidth: nativeEvent.contentSize.width,
                offset: nativeEvent.contentOffset.x,
              })
            }
            scrollEventThrottle={16}
            data={data}
            initialScrollIndex={
              initialScrollIndex >= 0 ? initialScrollIndex : undefined
            }
            getItemLayout={(_, index) => ({
              length: hourColumnWidth,
              offset: index * hourColumnWidth,
              index,
            })}
            keyExtractor={(item) => `${item.epochtime}`}
            renderItem={({ item }: any) => (
              <ForecastListColumn
                clockType={clockType}
                data={item}
                displayParams={displayParams}
                units={units}
                compact
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <HorizontalScrollFades
            edges={scrollEdges}
            testIDPrefix="hourly-forecast"
          />
        </View>
      </View>
      {displayParams
        .map((displayParam) => displayParam[1])
        .includes(DAY_LENGTH) &&
        !excludeDayLength && (
          <DayDurationRow step={data[data.length - 1]} clockType={clockType} />
        )}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  listContainer: {
    flex: 1,
  },
});

export default memo(connector(HourlyForecast));

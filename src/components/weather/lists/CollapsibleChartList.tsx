import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import CollapsibleListHeader from './CollapsibleListHeader';
import DaySelectorWrapper from '../wrappers/DaySelectorWrapper';
import TemperatureLineChart from '../charts/TemperatureLineChart';
import PrecipitationBarChart from '../charts/PrecipitationBarChart';
import WindLineChart from '../charts/WindLineChart';

import { TimestepData } from '../../../store/forecast/types';

type CollapsibleChartListProps = {
  data: TimestepData[] | false;
  selectedDate: string | undefined | false;
  showPreviousDay: () => void;
  showPreviousDisabled: boolean;
  showNextDay: () => void;
  showNextDisabled: boolean;
};

const CollapsibleChartList: React.FC<CollapsibleChartListProps> = ({
  data,
  selectedDate,
  showPreviousDay,
  showPreviousDisabled,
  showNextDay,
  showNextDisabled,
}) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

  return (
    <View>
      <CollapsibleListHeader
        accessibilityLabel={t('forecast:charts:temperatureAccessibilityLabel')}
        title={t('forecast:charts:temperature')}
        onPress={() =>
          openIndex === 0 ? setOpenIndex(undefined) : setOpenIndex(0)
        }
        open={openIndex === 0}
      />
      {data && openIndex === 0 && (
        <DaySelectorWrapper
          selectedDate={selectedDate}
          handlePrevious={showPreviousDay}
          previousDisabled={showPreviousDisabled}
          handleNext={showNextDay}
          nextDisabled={showNextDisabled}>
          <TemperatureLineChart data={data} />
        </DaySelectorWrapper>
      )}
      <CollapsibleListHeader
        accessibilityLabel={t(
          'forecast:charts:precipitationAccessibilityLabel'
        )}
        title={t('forecast:charts:precipitation')}
        onPress={() =>
          openIndex === 1 ? setOpenIndex(undefined) : setOpenIndex(1)
        }
        open={openIndex === 1}
      />
      {data && openIndex === 1 && (
        <DaySelectorWrapper
          selectedDate={selectedDate}
          handlePrevious={showPreviousDay}
          previousDisabled={showPreviousDisabled}
          handleNext={showNextDay}
          nextDisabled={showNextDisabled}>
          <PrecipitationBarChart data={data} />
        </DaySelectorWrapper>
      )}
      <CollapsibleListHeader
        accessibilityLabel={t('forecast:charts:windAccessibilityLabel')}
        title={t('forecast:charts:wind')}
        onPress={() =>
          openIndex === 2 ? setOpenIndex(undefined) : setOpenIndex(2)
        }
        open={openIndex === 2}
      />
      {data && openIndex === 2 && (
        <DaySelectorWrapper
          selectedDate={selectedDate}
          handlePrevious={showPreviousDay}
          previousDisabled={showPreviousDisabled}
          handleNext={showNextDay}
          nextDisabled={showNextDisabled}>
          <WindLineChart data={data} />
        </DaySelectorWrapper>
      )}
    </View>
  );
};

export default CollapsibleChartList;

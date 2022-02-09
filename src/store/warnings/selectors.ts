import { selectGeoid } from '@store/location/selector';
import { Selector, createSelector } from 'reselect';
import moment from 'moment';
import { State } from '../types';
import { WarningsState } from './types';

const selectWarningsDomain: Selector<State, WarningsState> = (state) =>
  state.warnings;

export const selectLoading = createSelector(
  selectWarningsDomain,
  (warnings) => warnings.loading
);

export const selectError = createSelector(
  selectWarningsDomain,
  (warnings) => warnings.error
);

const selectData = createSelector(
  selectWarningsDomain,
  (warnings) => warnings.data
);

export const selectWarnings = createSelector(
  [selectData, selectGeoid],
  (items, geoid) => items?.[geoid]?.warnings || []
);

export const selectUpdated = createSelector(
  [selectData, selectGeoid],
  (items, geoid) => items?.[geoid]?.updated || null
);

export const selectDailyWarningData = createSelector(
  [selectWarnings],
  (warnings) => {
    const dayCount = 5;
    const severityList = ['', 'Moderate', 'Severe', 'Extreme'];

    const days = Array.from({ length: dayCount }, (_, i) => {
      const dayStart = moment().startOf('day').add(i, 'days');
      const dayEnd = moment().endOf('day').add(i, 'days');

      const dailyWarnings = warnings.filter(
        ({ duration: { startTime, endTime } }) =>
          (dayStart.diff(moment(startTime)) <= 0 &&
            dayEnd.diff(moment(startTime)) > 0) ||
          (dayStart.diff(moment(endTime)) < 0 &&
            dayEnd.diff(moment(endTime)) > 0)
      );

      const daySeverity = Math.max(
        ...dailyWarnings.map(({ severity }) => severityList.indexOf(severity)),
        0
      );

      return {
        date: dayStart.valueOf(),
        severity: daySeverity,
        count: dailyWarnings.length,
        warnings: dailyWarnings,
      };
    });
    return days;
  }
);

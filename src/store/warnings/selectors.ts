import { selectGeoid } from '@store/location/selector';
import { Selector, createSelector } from 'reselect';
import moment from 'moment';
import { State } from '../types';
import { Warning, WarningsState } from './types';
import { knownWarningTypes, severityList } from './constants';

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

const selectFetchTimestamp = createSelector(
  selectWarningsDomain,
  (warnings) => warnings.fetchTimestamp
);

export const selectWarningsAge = createSelector(
  selectWarningsDomain,
  (warnings) => Date.now() - warnings.fetchSuccessTime
);

const getWarningDataForDays = (
  warnings: Warning[],
  dayCount: number,
  fetchTime?: number
) => {
  const days = Array.from({ length: dayCount }, (_, i) => {
    const dayStart = moment(fetchTime).startOf('day').add(i, 'days');
    const dayEnd = moment(fetchTime).endOf('day').add(i, 'days');

    const dailyWarnings = warnings.filter(
      ({ severity, type, duration: { startTime, endTime } }) => {
        if (!knownWarningTypes.includes(type)) {
          return false;
        }
        if (!severityList.includes(severity)) {
          return false;
        }
        const dsWsDiff = dayStart.diff(moment(startTime));
        const deWsDiff = dayEnd.diff(moment(startTime));
        const dsWeDiff = dayStart.diff(moment(endTime));
        const deWeDiff = dayEnd.diff(moment(endTime));

        // Starts duding day
        if (dsWsDiff <= 0 && deWsDiff >= 0) {
          return true;
        }
        // Ends during day
        if (dsWeDiff < 0 && deWeDiff >= 0) {
          return true;
        }
        // Starts before and ends after
        if (dsWsDiff > 0 && deWeDiff < 0) {
          return true;
        }
        return false;
      }
    );

    const daySeverity = Math.max(
      ...dailyWarnings.map(({ severity }) => severityList.indexOf(severity)),
      0
    );

    dailyWarnings.sort((a, b) => {
      const severityDiff = severityList.indexOf(b.severity) - severityList.indexOf(a.severity);
      if (severityDiff !== 0) return severityDiff;
      return knownWarningTypes.indexOf(a.type) - knownWarningTypes.indexOf(b.type);
    });

    return {
      date: dayStart.valueOf(),
      severity: daySeverity,
      type: dailyWarnings[0]?.type,
      count: dailyWarnings.length,
      warnings: dailyWarnings,
    };
  });
  return days;
};

export const selectDailyWarningData = createSelector(
  [selectWarnings, selectFetchTimestamp],
  (warnings, fetchTime) => getWarningDataForDays(warnings, 5, fetchTime)
);

export const selectCurrentDayWarningData = createSelector(
  selectWarnings,
  (warnings) => getWarningDataForDays(warnings, 1)
);

export const selectCapWarningData = createSelector(
  selectWarningsDomain,
  (warnings) => warnings.capData
);

export const selectFetchSuccessTime = createSelector(
  selectWarningsDomain,
  (warnings) => warnings.fetchSuccessTime
);

import moment from 'moment';
import {
  converter,
  getForecastParameterUnitTranslationKey,
  toPrecision,
} from './units';

import type { Moment } from 'moment-timezone';

export const formatAccessibleDate = (m: Moment, includeYear = true): string => {
  return m.format(includeYear ? 'dddd, LL' : 'dddd, D. MMMM');
};

export const formatAccessibleTime = (
  m: Moment,
  t: (key: string) => string,
  is24Hour = true
): string => {
  if (is24Hour) return m.format('H:mm');

  return (
    m.format('h:mm') +
    ' ' +
    (m.hours() >= 12 ? t('time:pmSpoken') : t('time:amSpoken'))
  );
};

export const formatAccessibleDateTime = (
  m: Moment,
  t: (key: string) => string,
  is24Hour = true,
  includeYear = true
): string => {
  return `${formatAccessibleDate(m, includeYear)} ${formatAccessibleTime(m, t, is24Hour)}`;
};

export const formatAccessibleTemperature = (
  val: string | number | undefined | null,
  t: (key: string) => string
): string => {
  if (val === null || val === undefined || val === '') return '-';

  const num = Number(val);
  if (isNaN(num)) return '-';

  const valuePart =
    num < 0 ? `${t('forecast:minus')} ${Math.abs(num)}` : `${num}`;
  return `${valuePart}`;
};

export type PrecipitationData =
  { precipitation: number | undefined | null; timestamp: number }[] | false;

const DAY_PERIODS = [
  { key: 'night', start: 0, end: 6 },
  { key: 'morning', start: 6, end: 12 },
  { key: 'afternoon', start: 12, end: 18 },
  { key: 'evening', start: 18, end: 24 },
];

export const formatAccessiblePrecipitation = (
  precipitationData: PrecipitationData,
  precipitationUnit: string,
  language: string,
  t: (key: string, options?: Record<string, string>) => string
): string => {
  const precipitationHourArr =
    precipitationData &&
    precipitationData.map((item) => ({
      hour: moment(item.timestamp * 1000).hours(),
      precipitation: item.precipitation,
    }));

  const validPrecipitationData = precipitationHourArr
    ? precipitationHourArr.filter(
        ({ precipitation }) =>
          typeof precipitation === 'number' &&
          Number.isFinite(precipitation) &&
          precipitation >= 0
      )
    : [];
  const rainyPeriods = DAY_PERIODS.filter(({ start, end }) =>
    validPrecipitationData.some(
      ({ hour, precipitation }) =>
        hour >= start && hour < end && (precipitation ?? 0) > 0
    )
  ).map(({ key }) => t(`forecast:precipitationStrip.${key}`));

  let accessibilityLabel = t('forecast:precipitationMissing');
  if (validPrecipitationData.length > 0) {
    const hasMissingData =
      validPrecipitationData.length !==
      (precipitationHourArr ? precipitationHourArr.length : 0);
    const periodsDescription =
      rainyPeriods.length > 1
        ? t('forecast:precipitationStrip.periodList', {
            first: rainyPeriods.slice(0, -1).join(', '),
            last: rainyPeriods[rainyPeriods.length - 1],
          })
        : rainyPeriods[0];
    const rainsEveryHour =
      !hasMissingData &&
      validPrecipitationData.every(
        ({ precipitation }) => (precipitation ?? 0) > 0
      );
    const hasDryHours = validPrecipitationData.some(
      ({ precipitation }) => precipitation === 0
    );
    let rainDescription = t('forecast:precipitationStrip.noRainAllDay');
    if (rainyPeriods.length === DAY_PERIODS.length && rainsEveryHour) {
      rainDescription = t('forecast:precipitationStrip.rainAllDay');
    } else if (rainyPeriods.length === DAY_PERIODS.length && hasDryHours) {
      rainDescription = t('forecast:precipitationStrip.rainAlmostAllDay');
    } else if (rainyPeriods.length > 0) {
      rainDescription = t('forecast:precipitationStrip.rainDuring', {
        periods: periodsDescription,
      });
    }

    if (hasMissingData) {
      accessibilityLabel =
        rainyPeriods.length > 0
          ? `${rainDescription}, ${t('forecast:precipitationStrip.missingTotal')}`
          : t('forecast:precipitationMissing');
    } else {
      const totalPrecipitation = validPrecipitationData.reduce(
        (total, { precipitation }) => total + (precipitation ?? 0),
        0
      );
      const decimalSeparator = language.split('-')[0] === 'en' ? '.' : ',';
      const totalDescription = t(
        'forecast:precipitationStrip.totalPrecipitation',
        {
          amount: toPrecision(
            'precipitation',
            precipitationUnit,
            converter(precipitationUnit, totalPrecipitation)
          ).replace('.', decimalSeparator),
          unit: t(
            `forecast:${getForecastParameterUnitTranslationKey(precipitationUnit)}`
          ),
        }
      );
      accessibilityLabel = `${rainDescription}, ${totalDescription}`;
    }
  }

  return accessibilityLabel;
};

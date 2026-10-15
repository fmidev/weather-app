import type { Moment } from 'moment-timezone';

export const formatAccessibleDate = (
  m: Moment,
  includeYear = true
): string => {
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

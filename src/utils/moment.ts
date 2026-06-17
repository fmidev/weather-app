import moment from 'moment';
import defaultConfig from '../../defaultConfig';

export type DateTimeFormatType = keyof typeof defaultConfig.settings.dateTime.default;

const { dateTime } = defaultConfig.settings;

const findLocaleFormats = (locale?: string) => {
  if (!locale) {
    return undefined;
  }

  const normalizedLocale = locale.toLowerCase();
  const baseLocale = normalizedLocale.split('-')[0];

  return dateTime.locales?.[normalizedLocale] ?? dateTime.locales?.[baseLocale];
};

const uppercaseFirst = (str: string): string =>
  str ? str[0].toUpperCase() + str.slice(1) : '';

const resolveFormat = (
  format: string
): { format: string; uppercaseFirst: boolean } => ({
  format: format.startsWith('U') ? format.slice(1) : format,
  uppercaseFirst: format.startsWith('U'),
});

const formatWithClockType = (format: string, clockType: 12 | 24 = 24): string =>
  clockType === 12 ? format.replace(/H{1,2}[.:]mm/g, 'h:mm a') : format;

export const getDateTimeFormat = (
  type: DateTimeFormatType,
  locale?: string
): string => {
  const localeFormats = findLocaleFormats(locale);

  return localeFormats?.[type] ?? dateTime.default[type];
};

declare module 'moment' {
  interface Moment {
    formatDateTime(
      type: DateTimeFormatType,
      locale?: string,
      clockType?: 12 | 24
    ): string;
  }
}

moment.fn.formatDateTime = function formatDateTime(
  this: moment.Moment,
  type: DateTimeFormatType,
  locale?: string,
  clockType?: 12 | 24
): string {
  const localeToUse = locale ?? this.locale();
  const { format: formatWithoutPrefix, uppercaseFirst: shouldUppercaseFirst } =
    resolveFormat(getDateTimeFormat(type, localeToUse));
  const format = formatWithClockType(formatWithoutPrefix, clockType);
  const formattedValue = this.clone().locale(localeToUse).format(format);

  return shouldUppercaseFirst ? uppercaseFirst(formattedValue) : formattedValue;
};

export default moment;

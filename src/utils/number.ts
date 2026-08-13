export const numericOrDash = (
  value: string | number | undefined | null
): string => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return '-';
  }

  return Number.isFinite(Number(value)) ? String(value) : '-';
};

type DotOrComma = ',' | '.';

export const toStringWithDecimal = (
  input: number | undefined,
  separator: DotOrComma
): string => {
  if (Number.isNaN(input) || input === 0 || !input) return `0${separator}0`;
  if (Number.isInteger(input)) return `${input}${separator}0`;
  return input.toString().replace('.', separator);
};

export const roundCoordinates = (value: number): number => {
  const stringValue = value.toString();
  const items = stringValue.split('.');

  // Return original value if maximum 4 decimal places
  if (items.length === 2 && items[1].length <= 4) return value;

  return +(Math.round(parseFloat(`${value}e+4`)) + 'e-4');
};

export const roundToNearestTen = (value: number): number => {
  const rounded = Math.round(value / 10) * 10;
  return Object.is(rounded, -0) ? 0 : rounded;
};

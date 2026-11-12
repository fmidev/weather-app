import { ChartDomain, ChartType } from './types';

const fiveBasedStep = (range: number): number => {
  const target = range / 6;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(target, 5)));
  return [1, 2, 5, 10]
    .map((factor) => factor * magnitude)
    .find((step) => step >= Math.max(target, 5)) ?? magnitude * 10;
};

const pressureStep = (range: number, observation: boolean): number =>
  observation && range <= 30 ? 5 : Math.max(10, fiveBasedStep(range));
const isHectopascal = (unit: string): boolean => unit === 'hPa' || unit === 'mbar';

export const alignTemperatureDomain = (
  domain: ChartDomain,
  chartType: ChartType
): ChartDomain => {
  if (!['temperature', 'weather'].includes(chartType) || !domain.y) return domain;

  const minimum = chartType === 'weather' ? Math.min(0, domain.y[0]) : domain.y[0];
  const maximum = chartType === 'weather' ? Math.max(5, domain.y[1]) : domain.y[1];
  const step = fiveBasedStep(maximum - minimum);
  return {
    ...domain,
    y: [Math.floor(minimum / step) * step, Math.ceil(maximum / step) * step],
  };
};

export const alignWindDomain = (
  domain: ChartDomain,
  chartType: ChartType,
  maximumValue?: number
): ChartDomain => {
  if (chartType !== 'wind' || !domain.y) return domain;

  if (maximumValue !== undefined && Number.isFinite(maximumValue) && maximumValue < 15) {
    return { ...domain, y: [0, 15] };
  }

  const step = fiveBasedStep(domain.y[1]);
  return { ...domain, y: [0, Math.ceil(domain.y[1] / step) * step] };
};

export const alignPressureDomain = (
  domain: ChartDomain,
  chartType: ChartType,
  pressureUnit: string,
  observation = false
): ChartDomain => {
  if (chartType !== 'pressure' || !isHectopascal(pressureUnit) || !domain.y) return domain;

  const [minimum, maximum] = domain.y;
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || maximum < minimum) return domain;
  let step = pressureStep(maximum - minimum, observation);
  while (true) {
    let lower = Math.floor(minimum / step) * step;
    let upper = Math.ceil(maximum / step) * step;
    while (upper - lower < 2 * step) {
      if (lower >= step && minimum - lower <= upper - maximum) lower -= step;
      else upper += step;
    }
    const nextStep = pressureStep(upper - lower, observation);
    if (nextStep === step) return { ...domain, y: [lower, upper] };
    step = nextStep;
  }
};

export const getChartYTicks = (
  domain: ChartDomain,
  chartType: ChartType,
  pressureUnit = 'hPa',
  observation = false
): number[] => {
  const [minimum, maximum] = domain.y ?? [0, 10];
  if (['temperature', 'weather'].includes(chartType)) {
    const step = fiveBasedStep(maximum - minimum);
    const first = Math.ceil(minimum / step) * step;
    const last = Math.floor(maximum / step) * step;
    return Array.from({ length: Math.round((last - first) / step) + 1 }, (_, index) =>
      first + index * step
    );
  }

  if (chartType === 'wind') {
    const step = fiveBasedStep(maximum);
    return Array.from({ length: Math.floor(maximum / step) + 1 }, (_, index) => index * step);
  }

  if (chartType === 'pressure' && isHectopascal(pressureUnit)) {
    const step = pressureStep(maximum - minimum, observation);
    const first = Math.ceil(minimum / step) * step;
    const last = Math.floor(maximum / step) * step;
    return Array.from({ length: Math.round((last - first) / step) + 1 }, (_, index) =>
      first + index * step
    );
  }

  const stepCount = chartType === 'visCloud' ? 4 : 5;
  return Array.from({ length: stepCount + 1 }, (_, index) =>
    minimum + index * (maximum - minimum) / stepCount
  );
};

import Config from 'react-native-config';
import { UnitType, UnitMap } from '@store/settings/types';

export type Unit = {
  parameterName: string;
  parameters: string[];
  ignoreInSettings?: boolean;
  unitTypes: UnitType[];
};

export const UNITS: Unit[] = [
  {
    parameterName: 'temperature',
    parameters: [
      'temperature',
      'feelsLike',
      'dewPoint',
      'maximumTemperature',
      'minimumTemperature',
      'minimumGroundTemperature06',
    ],
    unitTypes: [
      {
        unitId: 1,
        unitAbb: 'C',
        unit: 'celsius',
        unitPrecision: 0,
      },
      {
        unitId: 2,
        unitAbb: 'F',
        unit: 'fahrenheit',
        unitPrecision: 0,
      },
    ],
  },
  {
    parameterName: 'precipitation',
    parameters: ['precipitation1h', 'rrday'],
    unitTypes: [
      {
        unitId: 1,
        unitAbb: 'mm',
        unit: 'millimeter',
        unitPrecision: 1,
      },
      {
        unitId: 2,
        unitAbb: 'in',
        unit: 'inch',
        unitPrecision: 2,
      },
    ],
  },
  {
    parameterName: 'precipitationIntensity',
    parameters: ['ri_10min'],
    ignoreInSettings: true,
    unitTypes: [
      {
        unitId: 1,
        unitAbb: 'mm/h',
        unit: 'millimeters per hour',
        unitPrecision: 1,
      },
      {
        unitId: 2,
        unitAbb: 'in/h',
        unit: 'inches per hour',
        unitPrecision: 2,
      },
    ],
  },
  {
    parameterName: 'wind',
    parameters: ['windSpeedMS', 'hourlymaximumgust', 'windGust'],
    unitTypes: [
      {
        unitId: 1,
        unitAbb: 'm/s',
        unit: 'meters per second',
        unitPrecision: 0,
      },
      {
        unitId: 2,
        unitAbb: 'km/h',
        unit: 'kilometers per hour',
        unitPrecision: 0,
      },
      {
        unitId: 3,
        unitAbb: 'mph',
        unit: 'miles per hour',
        unitPrecision: 0,
      },
      {
        unitId: 4,
        unitAbb: 'bft',
        unit: 'beaufort',
        unitPrecision: 0,
      },
      {
        unitId: 5,
        unitAbb: 'kn',
        unit: 'knot',
        unitPrecision: 0,
      },
    ],
  },
  {
    parameterName: 'pressure',
    parameters: ['pressure'],
    unitTypes: [
      {
        unitId: 1,
        unitAbb: 'hPa',
        unit: 'hehtopascal',
        unitPrecision: 0,
      },
      {
        unitId: 2,
        unitAbb: 'inHg',
        unit: 'inch of mercury',
        unitPrecision: 1,
      },
      {
        unitId: 3,
        unitAbb: 'mmHg',
        unit: 'millimeter of mercury',
        unitPrecision: 0,
      },
      {
        unitId: 4,
        unitAbb: 'mbar',
        unit: 'millibar',
        unitPrecision: 1,
      },
    ],
  },
];

const defaultUnitMapper = {
  temperature: parseInt(Config.UNIT_TEMPERATURE!, 10),
  precipitation: parseInt(Config.UNIT_PRECIPITATION!, 10),
  wind: parseInt(Config.UNIT_WIND!, 10),
  pressure: parseInt(Config.UNIT_PRESSURE!, 10),
};

export const getDefaultUnits = (): UnitMap | undefined => {
  const unitNames = UNITS.map((u) => u.parameterName);
  const defaultUnits =
    unitNames &&
    unitNames.reduce((res, name: string) => {
      const unit = UNITS.find((u) => u.parameterName === name);
      if (!unit) return res;
      let unitType =
        unit &&
        unit.unitTypes.find(
          (type) => type.unitId === (defaultUnitMapper as any)[name]
        );
      if (!unitType) {
        [unitType] = unit.unitTypes;
      }
      return { ...res, [name]: unitType };
    }, {});

  return defaultUnits as UnitMap;
};

export const toPrecision = (
  unit: string,
  unitAbb: string,
  value: number,
  decimals?: number
): string => {
  const unitTypes = UNITS.find((u) => u.parameterName === unit)?.unitTypes;
  if (!unitTypes) return value.toString();
  const type: UnitType | undefined = unitTypes.find(
    (t) => t.unitAbb === unitAbb
  );
  if (type) return value.toFixed(decimals ?? type.unitPrecision);
  return value.toString();
};

// converts given numeric value to corresponding unit abbreviation
export const converter = (unitAbb: string, value: number): number => {
  if (value === null || value === undefined) return value;

  switch (unitAbb) {
    // temperature
    case 'F':
      return value * 1.8 + 32;
    // precipitation
    case 'in':
    case 'in/h':
      return value / 25.4;
    // wind
    case 'km/h':
      return value * 3.6;
    case 'mph':
      return value * 2.24;
    case 'bft':
      return value * 1.27; // 1 [m/s] = 1.126 840 655 625 3 [Bft]
    case 'kn':
      return value * 1.94;
    // pressure
    case 'inHg':
      return value * 0.03;
    case 'mmHg':
      return value * 0.75;
    default:
      // default values:
      // temperature: celcius [C]
      // precipitation: [mm]
      // wind: meters per second [ms]
      // pressure: hehtopascal [hPa] = millibascal [mbar]
      return value;
  }
};

export const getForecastParameterUnitTranslationKey = (unit: string) => {
  switch (unit) {
    case '°C':
    case 'C':
      return 'celsius';
    case '°F':
    case 'F':
      return 'fahrenheit';
    case 'm/s':
      return 'metersPerSecond';
    case 'km/h':
      return 'kilometersPerHour';
    case 'mph':
      return 'milesPerHour';
    case 'kn':
      return 'knots';
    case 'bft':
      return 'beaufort';
    case 'mm':
      return 'millimeters';
    case 'in':
      return 'inches';
    case 'hPa':
      return 'hectopascals';
    case 'mbar':
      return 'millibars';
    case 'mmHg':
      return 'millimetersOfMercury';
    case 'inHg':
      return 'inchesOfMercury';
    default:
      return '';
  }
};

export const resolveUnitParameterName = (param: string): string | undefined => {
  const unit = UNITS.find((u) => u.parameters.includes(param));
  return unit?.parameterName;
};

export const getUnitsHiddenInSettings = () => {
  return UNITS.filter(unit => unit.ignoreInSettings === true).map(unit => unit.parameterName)
}
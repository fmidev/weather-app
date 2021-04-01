import Config from 'react-native-config';
import { UnitType, UnitMap } from '../store/settings/types';

export type Unit = {
  parameterName: string;
  unitTypes: UnitType[];
};

export const UNITS: Unit[] = [
  {
    parameterName: 'temperature',
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
    parameterName: 'wind',
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
        unitAbb: 'Bft',
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
    unitTypes: [
      {
        unitId: 1,
        unitAbb: 'hPa',
        unit: 'hehtopascal',
        unitPrecision: 1,
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
  temperature: parseInt(Config.UNIT_TEMPERATURE, 10),
  precipitation: parseInt(Config.UNIT_PRECIPITATION, 10),
  wind: parseInt(Config.UNIT_WIND, 10),
  pressure: parseInt(Config.UNIT_PRESSURE, 10),
};

export const getDefaultUnits = (): UnitMap | undefined => {
  const unitNames = Config.UNITS && Config.UNITS.split(',');
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

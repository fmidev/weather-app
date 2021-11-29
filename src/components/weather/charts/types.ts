import React from 'react';
import { TimestepData as ForDataStep } from '@store/forecast/types';
import { TimeStepData as ObsDataStep } from '@store/observation/types';

export interface ChartValue {
  x: number;
  y: number | null;
}

export type Parameter = keyof ForDataStep | keyof ObsDataStep;

export type ChartTypes = {
  [key in ChartType]: Parameter[];
};
export interface ChartValues {
  [key: string]: ChartValue[] | [];
}

export type ChartType =
  | 'humidity'
  | 'pressure'
  | 'visCloud'
  | 'cloud'
  | 'precipitation'
  | 'temperature'
  | 'wind';

export type ChartSettings = {
  [key in ChartType]: {
    params: Parameter[];
    component: React.FC<ChartDataProps>;
  };
};

export type ChartDomain =
  | {
      x: [number, number];
      y?: [number, number];
    }
  | {
      x?: [number, number];
      y: [number, number];
    };

export type ChartMinMax = (number | null)[];

export type ChartData = ForDataStep[] | ObsDataStep[];

export type ChartDataProps = {
  chartValues: ChartValues;
  domain: ChartDomain;
  width: number;
};

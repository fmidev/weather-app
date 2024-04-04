import React from 'react';
import { TimeStepData as ForDataStep } from '@store/forecast/types';
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
  | 'wind'
  | 'snowDepth'
  | 'uv'
  | 'weather'
  | 'daily';

export type ChartSettings = {
  params: Parameter[];
  Component: React.FC<ChartDataProps>;
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
  chartDomain: ChartDomain;
  chartWidth: number;
};

import Icon from '@assets/Icon';
import { Severity, WarningType } from '@store/warnings/types';
import React from 'react';
import { Config } from '@config';
import { View } from 'react-native';

type WarningSymbolProps = {
  type: WarningType;
  size?: number;
  severity?: Severity
};
const WarningSymbol: React.FC<WarningSymbolProps> = ({
  type,
  size,
  severity
}) => {
  const { capViewSettings } = Config.get('warnings');

  const colorMap: { [key in Severity]: string } = {
    Moderate: 'yellow',
    Severe: 'orange',
    Extreme: 'red',
  };

  // map event-string to warning icon string
  const typeMap: { [key in WarningType]: string } = {
    'Severe weather warning': 'severe-weather-warning',
    'Wind and waves warning': 'wind-and-waves-warning',
    'High tide warning': 'high-tide-warning',
    'Disturbance advisory': 'disturbance-advisory',
    'Disturbance watch': 'disturbance-watch',
    'Disturbance warning': 'disturbance-warning',
    'Tropical depression advisory': 'tropical-depression-advisory',
    'Tropical depression watch': 'tropical-depression-watch',
    'Tropical depression warning': 'tropical-depression-warning',
    'Tropical storm advisory': 'tropical-storm-advisory',
    'Tropical storm watch': 'tropical-storm-watch',
    'Tropical storm warning': 'tropical-storm-warning',
    'Hurricane advisory': 'hurricane-advisory',
    'Hurricane watch': 'hurricane-watch',
    'Hurricane warning': 'hurricane-warning',
    'Post-tropical cyclone advisory': 'post-tropical-cyclone-advisory',
    'Post-tropical cyclone watch': 'post-tropical-cyclone-watch',
    'Post-tropical cyclone warning': 'post-tropical-cyclone-warning',
    'Landslide warning': 'landslide-warning',
    'Forest fire warning': 'forest-fire-warning',
    'Low temperature advisory': 'low-temperature-advisory',
    'Low temperature watch': 'low-temperature-watch',
    'Low temperature warning': 'low-temperature-warning',
    'High temperature advisory': 'high-temperature-advisory',
    'High temperature watch': 'high-temperature-watch',
    'High temperature warning': 'high-temperature-warning',
    'Rainfall advisory': 'rainfall-advisory',
    'Rainfall watch': 'rainfall-watch',
    'Rainfall warning': 'rainfall-warning',
    'Flash flood probability advisory': 'flash-flood-probability-advisory',
    'Flash flood probability watch': 'flash-flood-probability-watch',
    'Flash flood probability warning': 'flash-flood-probability-warning',
    'Flash flood advisory': 'flash-flood-advisory',
    'Flash flood watch': 'flash-flood-watch',
    'Flash flood warning': 'flash-flood-warning',
    'Low river level advisory': 'low-river-level-advisory',
    'Low river level watch': 'low-river-level-watch',
    'Low river level warning': 'low-river-level-warning',
    'High river level advisory': 'high-river-level-advisory',
    'High river level watch': 'high-river-level-watch',
    'High river level warning': 'high-river-level-warning',
    'Flood routing advisory': 'flood-routing-advisory',
    'Flood routing watch': 'flood-routing-watch',
    'Flood routing warning': 'flood-routing-warning',
    'Flash flood advisory due reservoir water discharge': 'flash-flood-advisory-due-reservoir-water-discharge',
    'Flash flood watch due reservoir water discharge': 'flash-flood-watch-due-reservoir-water-discharge',
    'Flash flood warning due reservoir water discharge': 'flash-flood-warning-due-reservoir-water-discharge',
    'River flooding warning': 'river-flooding-warning',
    'Tiempo lluvioso': 'severe-weather-warning',
    'Advertencia por viento y oleaje': 'wind-and-waves-warning',
    'Advertencia por pleamar': 'high-tide-warning',
    'Aviso por perturbación': 'disturbance-advisory',
    'Advertencia por perturbación': 'disturbance-watch',
    'Alerta por perturbación': 'disturbance-warning',
    'Aviso por depresión tropical': 'tropical-depression-advisory',
    'Advertencia por depresión tropical': 'tropical-depression-watch',
    'Alerta por depresión tropical': 'tropical-depression-warning',
    'Aviso por tormenta tropical': 'tropical-storm-advisory',
    'Advertencia por tormenta tropical': 'tropical-storm-watch',
    'Alerta de tormenta tropical': 'tropical-storm-warning',
    'Aviso por huracán': 'hurricane-advisory',
    'Advertencia por huracán': 'hurricane-watch',
    'Alerta por huracán': 'hurricane-warning',
    'Aviso por ciclón post-tropical': 'post-tropical-cyclone-advisory',
    'Advertencia por ciclón post-tropical': 'post-tropical-cyclone-watch',
    'Alerta por ciclón post-tropical': 'post-tropical-cyclone-warning',
    'Alerta por deslizamiento de tierra': 'landslide-warning',
    'Alerta por incendios de la cobertura vegetal': 'forest-fire-warning',
    'Aviso por bajas temperaturas': 'low-temperature-advisory',
    'Advertencia por bajas temperaturas': 'low-temperature-watch',
    'Alerta por bajas temperaturas': 'low-temperature-warning',
    'Aviso por alta temperatura': 'high-temperature-advisory',
    'Advertencia por alta temperatura': 'high-temperature-watch',
    'Alerta por alta temperatura': 'high-temperature-warning',
    'Aviso por lluvias': 'rainfall-advisory',
    'Advertencia por lluvias': 'rainfall-watch',
    'Alerta por lluvias': 'rainfall-warning',
    'Aviso por creciente súbita': 'flash-flood-advisory',
    'Advertencia por creciente súbita': 'flash-flood-watch',
    'Alerta por creciente súbita': 'flash-flood-warning',
    'Aviso por niveles bajos': 'low-river-level-advisory',
    'Advertencia por niveles bajos': 'low-river-level-watch',
    'Alerta por niveles muy bajos': 'low-river-level-warning',
    'Aviso por niveles altos': 'high-river-level-advisory',
    'Advertencia por niveles altos': 'high-river-level-watch',
    'Alerta por niveles altos': 'high-river-level-warning',
    'Aviso por tránsito de creciente': 'flood-routing-advisory',
    'Advertencia por tránsito de creciente': 'flood-routing-watch',
    'Alerta por tránsito de creciente': 'flood-routing-warning',
    'Aviso por creciente de desembalse': 'flash-flood-advisory-due-reservoir-water-discharge',
    'Advertencia por creciente de desembalse': 'flash-flood-watch-due-reservoir-water-discharge',
    'Alerta por creciente de desembalse': 'flash-flood-warning-due-reservoir-water-discharge',
    'Alerta por desbordamiento del río': 'river-flooding-warning'
  };

  let name = 'warnings';
  const typeName = typeMap[type];
  if (typeName) {
    // add type string
    name += `-${typeMap[type]}`;
  }

  if (capViewSettings?.severityBackgroundInSymbol && severity) {
    return (
      <View style={[{ backgroundColor: colorMap[severity], borderRadius: (size ?? 24) / 2 }]}>
        <Icon name={name} width={size ?? 24} height={size ?? 24} />
      </View>
    );
  } else {
    return <Icon name={name} width={size ?? 24} height={size ?? 24} />;
  }
};

export default WarningSymbol;

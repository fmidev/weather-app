import React, { useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Platform } from 'react-native';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '@utils/map';

import { State } from '@store/types';
import { Layer, MapOverlay } from '@store/map/types';
import { selectActiveOverlay, selectSliderTime } from '@store/map/selectors';
import { useTheme, useIsFocused } from '@react-navigation/native';
import packageJSON from '../../../../package.json';
import MemoizedWMSTile from './MemoizedWMSTile';

const mapStateToProps = (state: State) => ({
  activeOverlayId: selectActiveOverlay(state),
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type WMSOverlayProps = PropsFromRedux & {
  overlay: MapOverlay;
  library?: 'maplibre' | 'react-native-maps';
};

const WMSOverlay: React.FC<WMSOverlayProps> = ({
  activeOverlayId,
  sliderTime,
  overlay,
  library = 'react-native-maps',
}) => {
  const { dark } = useTheme();
  const observation = overlay.observation as Layer;
  const forecast = overlay.forecast as Layer;
  const isFocused = useIsFocused();

  const borderTime = useMemo<{
    time?: string;
    type: 'observation' | 'forecast';
  }>(() => {
    if (forecast && forecast.start) {
      if (observation && observation.end) {
        return { time: observation.end, type: 'observation' };
      }
      return { time: forecast.start, type: 'forecast' };
    }

    if (observation && observation.end) {
      return { time: observation.end, type: 'observation' };
    }

    return { type: 'observation' };
  }, [forecast, observation]);

  const current = useMemo(() => new Date(sliderTime * 1000).toISOString(), [sliderTime]);

  const currentStep = getSliderStepSeconds(overlay.step);

  const memoizedMinUnix = useMemo(
    () => getSliderMinUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );
  const memoizedMaxUnix = useMemo(
    () => getSliderMaxUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );

  const urlMap = useMemo(() => {
    const map = new Map<string, string>();
    if ((!observation?.url && !forecast?.url) || !borderTime.time) {
      return map;
    }

    const theme = dark ? 'dark' : 'light';

    for (let curr = memoizedMinUnix; curr <= memoizedMaxUnix; curr += currentStep) {
      const stamp = new Date(curr * 1000).toISOString();

      const isForecast = borderTime.type === 'forecast'
        ? stamp >= borderTime.time
        : stamp > borderTime.time;

      const layer = (isForecast ? forecast : observation) || {};
      if (layer.url) {
        map.set(
          stamp,
          `${layer.url}&styles=${
            typeof layer.styles === 'string' ? layer.styles : layer.styles?.[theme]
          }&time=${stamp}&who=${packageJSON.name}-${Platform.OS}`
        );
      }
    }

    return map;
  }, [
    observation,
    forecast,
    borderTime,
    memoizedMinUnix,
    memoizedMaxUnix,
    currentStep,
    dark,
  ]);

  if (!overlay.observation && !overlay.forecast) return null;

  // return null until something to return
  if (!urlMap.has(current) || sliderTime === 0 || !isFocused) return null;

  const tiles = [...urlMap.keys()];

  const iosTiles = () => {
    const currentTileIndex = tiles.indexOf(current);
    if (currentTileIndex < 0) {
      return [];
    }
    return [
      ...new Set([
        tiles[currentTileIndex],
        tiles[currentTileIndex !== 0 ? currentTileIndex - 1 : 0],
        tiles[currentTileIndex !== tiles.length - 1 ? currentTileIndex + 1 : 0],
      ]),
    ];
  };

  const renderTiles = Platform.OS === 'ios' && library !== 'maplibre' ? iosTiles() : tiles;

  return (
    <>
      {renderTiles.map((k) => (
        <MemoizedWMSTile
          key={k}
          urlTemplate={urlMap.get(k) as string}
          opacity={k === current ? 1 : 0}
          tileSize={overlay.tileSize}
          library={library}
        />
      ))}
    </>
  );
};

export default connector(WMSOverlay);

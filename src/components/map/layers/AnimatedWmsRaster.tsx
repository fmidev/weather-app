import React, { useEffect, useMemo, useState } from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

const FRAME_COUNT = 10;

type Props = {
  // 10 kpl tileUrlTemplates (yksi per ajanhetki)
  // Esim. WMS-template, jossa on {bbox-epsg-3857} tms. mitä sinulla jo on käytössä
  frameUrls: string[]; // length 10
  isPlaying?: boolean;
  fps?: number; // esim. 2..5
};

export function AnimatedWmsRaster({ frameUrls, isPlaying = true, fps = 3 }: Props) {
  const [frame, setFrame] = useState(0);

  // Varmista ettei array muutu referenssinä turhaan
  const urls = useMemo(() => frameUrls.slice(0, FRAME_COUNT), [frameUrls]);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(1000 / fps, 150); // älä yritä 60fps, raster-tiles ei kestä
    const id = setInterval(() => {
      setFrame((prev) => (prev + 1) % urls.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [isPlaying, fps, urls.length]);

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <MapLibreGL.MapView style={{ flex: 1 }}>
      <MapLibreGL.Camera
        zoomLevel={5}
        centerCoordinate={[25.0, 64.5]}
      />

      {/* Renderöi KAIKKI framet koko ajan: source+layer id:t uniikeiksi */}
      {urls.map((tileUrl, i) => {
        const sourceId = `wms-source-${i}`;
        const layerId = `wms-layer-${i}`;

        return (
          <MapLibreGL.RasterSource
            key={sourceId}
            id={sourceId}
            tileUrlTemplates={[tileUrl]}
            tileSize={256}
          >
            <MapLibreGL.RasterLayer
              id={layerId}
              sourceID={sourceId}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                rasterOpacity: i === frame ? 1 : 0,
                // vaihtoehto: täysin piiloon (jos haluat)
                // visibility: i === frame ? "visible" : "none",
              }}
            />
          </MapLibreGL.RasterSource>
        );
      })}
    </MapLibreGL.MapView>
  );
}
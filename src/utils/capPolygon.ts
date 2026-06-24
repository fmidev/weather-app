import {
  GeoJsonPosition,
  simplifyPolygon,
} from '@utils/simplifyPolygon';

export const parseCapPolygon = (
  polygon: string,
  toleranceMeters?: number
): GeoJsonPosition[] => {
  const positions = polygon
    .trim()
    .split(/\s+/)
    .reduce<GeoJsonPosition[]>((validPositions, coordinate) => {
      const parts = coordinate.split(',');

      if (parts.length !== 2 || parts.some((part) => part.trim() === '')) {
        return validPositions;
      }

      const latitude = Number(parts[0]);
      const longitude = Number(parts[1]);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return validPositions;
      }

      validPositions.push([longitude, latitude]);
      return validPositions;
    }, []);

  // A zero tolerance closes the ring without simplifying its geometry.
  return simplifyPolygon(positions, toleranceMeters ?? 0);
};

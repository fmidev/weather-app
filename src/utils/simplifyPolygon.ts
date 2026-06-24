export type GeoJsonPosition = [longitude: number, latitude: number];

type ProjectedPosition = [x: number, y: number];

const EARTH_RADIUS_METERS = 6_371_008.8;

const positionsEqual = (
  first: GeoJsonPosition,
  second: GeoJsonPosition
): boolean => first[0] === second[0] && first[1] === second[1];

const squaredSegmentDistance = (
  point: ProjectedPosition,
  start: ProjectedPosition,
  end: ProjectedPosition
): number => {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const position =
      ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);

    if (position > 1) {
      x = end[0];
      y = end[1];
    } else if (position > 0) {
      x += dx * position;
      y += dy * position;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;

  return dx * dx + dy * dy;
};

const simplifyLine = (
  positions: ProjectedPosition[],
  squaredTolerance: number
): number[] => {
  const lastIndex = positions.length - 1;
  const retained = new Uint8Array(positions.length);
  const ranges: Array<[number, number]> = [[0, lastIndex]];

  retained[0] = 1;
  retained[lastIndex] = 1;

  while (ranges.length > 0) {
    const [firstIndex, finalIndex] = ranges.pop() as [number, number];
    let furthestIndex = 0;
    let furthestDistance = squaredTolerance;

    for (let index = firstIndex + 1; index < finalIndex; index += 1) {
      const distance = squaredSegmentDistance(
        positions[index],
        positions[firstIndex],
        positions[finalIndex]
      );

      if (distance > furthestDistance) {
        furthestIndex = index;
        furthestDistance = distance;
      }
    }

    if (furthestIndex !== 0) {
      retained[furthestIndex] = 1;
      ranges.push([firstIndex, furthestIndex], [furthestIndex, finalIndex]);
    }
  }

  return Array.from(retained)
    .map((value, index) => (value ? index : -1))
    .filter((index) => index >= 0);
};

const closeRing = (positions: GeoJsonPosition[]): GeoJsonPosition[] => {
  if (positions.length === 0) return positions;
  if (positionsEqual(positions[0], positions[positions.length - 1])) {
    return positions;
  }
  return [...positions, positions[0]];
};

/**
 * Simplifies a GeoJSON polygon ring using a tolerance measured in meters.
 */
export const simplifyPolygon = (
  ring: GeoJsonPosition[],
  toleranceMeters: number
): GeoJsonPosition[] => {
  if (ring.length < 3) return ring;

  const openRing = positionsEqual(ring[0], ring[ring.length - 1])
    ? ring.slice(0, -1)
    : ring;

  if (openRing.length <= 3 || toleranceMeters <= 0) return closeRing(openRing);

  const referenceLatitude =
    openRing.reduce((sum, position) => sum + position[1], 0) / openRing.length;
  const longitudeScale = Math.cos((referenceLatitude * Math.PI) / 180);
  const projectedPositions: ProjectedPosition[] = openRing.map(
    ([longitude, latitude]) => [
      EARTH_RADIUS_METERS * (longitude * Math.PI / 180) * longitudeScale,
      EARTH_RADIUS_METERS * (latitude * Math.PI / 180),
    ]
  );
  const retainedIndexes = simplifyLine(
    projectedPositions,
    toleranceMeters * toleranceMeters
  );
  const simplifiedRing = retainedIndexes.map((index) => openRing[index]);

  // A valid polygon needs at least three distinct positions.
  return closeRing(simplifiedRing.length >= 3 ? simplifiedRing : openRing);
};

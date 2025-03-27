export interface GeoMagneticStation {
  lat: number;
  lon: number;
  organization: string;
  country: string;
  limit1: number;
  limit2: number;
  name: string;
  fmisid: number;
}

const stations:Array<GeoMagneticStation> = [
  { lat: 69.76, lon: 27.01, organization: "FMI", country: "FI", limit1: 55, limit2: 165, name: "Kevo", fmisid: 102035},
  { lat: 69.05, lon: 20.79, organization: "FMI", country: "FI", limit1: 61, limit2: 210, name: "Kilpisjärvi", fmisid: 133879},
  { lat: 68.56, lon: 27.29, organization: "FMI", country: "FI", limit1: 72, limit2: 275, name: "Ivalo", fmisid: 133847 },
  { lat: 68.02, lon: 23.53, organization: "FMI", country: "FI", limit1: 75, limit2: 300, name: "Muonio", fmisid: 133749 },
  { lat: 67.37, lon: 26.63, organization: "SGO", country: "FI", limit1: 74, limit2: 290, name: "Sodankylä", fmisid: 101932 },
  { lat: 66.90, lon: 24.08, organization: "FMI", country: "FI", limit1: 73, limit2: 285, name: "Pello", fmisid: 133821 },
  { lat: 65.90, lon: 26.41, organization: "FMI", country: "FI", limit1: 70, limit2: 240, name: "Ranua", fmisid: 100758},
  { lat: 64.52, lon: 27.23, organization: "FMI", country: "FI", limit1: 68, limit2: 200, name: "Oulujärvi", fmisid: 133820},
  { lat: 62.77, lon: 30.97, organization: "FMI", country: "FI", limit1: 64, limit2: 150, name: "Mekrijärvi", fmisid: 133891},
  { lat: 62.25, lon: 26.60, organization: "FMI", country: "FI", limit1: 63, limit2: 140, name: "Hankasalmi", fmisid: 133846 },
  { lat: 60.50, lon: 24.65, organization: "FMI", country: "FI", limit1: 60, limit2: 120, name: "Nurmijärvi", fmisid: 101149},
  { lat: 58.26, lon: 26.46, organization: "FMI", country: "EE", limit1: 55, limit2: 100, name: "Tartto", fmisid: 133843}
];

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const findNearestGeoMagneticObservationStation = (lat: number, lon: number):GeoMagneticStation => {
  let nearest = stations[0];
  let shortestDistance = getDistance(lat, lon, nearest.lat, nearest.lon);

  for (const station of stations.slice(1)) {
    const distance = getDistance(lat, lon, station.lat, station.lon);
    if (distance < shortestDistance) {
      nearest = station;
      shortestDistance = distance;
    }
  }

  return nearest;
}

export const isAuroraBorealisLikely = (geomagneticRIndex: number, station: GeoMagneticStation):boolean => {
  return geomagneticRIndex >= station.limit2
}
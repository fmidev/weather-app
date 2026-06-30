import locations from '@assets/locations/locations.json';
import countries from '@assets/locations/countries.json';
import { getDistance } from 'geolib';

import { Country, Location, SearchLocation } from '@assets/locations/types';

const searchLocations = [] as SearchLocation[];
let initializedLanguage: string | undefined;

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const countryByCode = (countries as Country[]).reduce<Record<string, Country>>(
  (countryMap, country) => ({
    ...countryMap,
    [country.country]: country,
  }),
  {}
);

const getCountryName = (countryCode: string, language: string) => {
  const country = countryByCode[countryCode];

  return country?.name[language] || country?.name.primary || countryCode;
};

const getSearchScore = (
  location: SearchLocation,
  query: string,
  language: string
) => {
  const name = normalizeText(location.name[language] || location.name.primary);
  const region = normalizeText(
    location.region[language] || location.region.primary
  );

  if (name === query) {
    return 100;
  }

  if (name.startsWith(query)) {
    return 80;
  }

  if (region.startsWith(query)) {
    return 60;
  }

  if (name.includes(query)) {
    return 50;
  }

  if (location.searchName.includes(query)) {
    return 30;
  }

  if (location.countryName.includes(query)) {
    return 10;
  }

  return 0;
};

export const initSearchLocations = (language: string) => {
  searchLocations.length = 0;

  (locations as Location[]).forEach((location) => {
    const searchLocation: SearchLocation = {
      ...location,
      searchName: normalizeText(
        `${location.name[language] || location.name.primary}, ${location.region[language] || location.region.primary}`
      ),
      countryName: normalizeText(getCountryName(location.country, language)),
    };

    searchLocations.push(searchLocation);
  });
  initializedLanguage = language;
};

export const search = (query: string, language: string, maxResults = 20) => {
  const normalizedQuery = normalizeText(query).trim();
  if (normalizedQuery.length === 0) return [];

  if (searchLocations.length === 0 || initializedLanguage !== language) {
    initSearchLocations(language);
  }

  return searchLocations
    .map((location) => ({
      location,
      score: getSearchScore(location, normalizedQuery, language),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (b.location.population || 0) - (a.location.population || 0);
    })
    .slice(0, maxResults)
    .map(({ location }) => location);
};

export const findNearestLocation = (
  latitude: number,
  longitude: number,
  maxDistance: number
): Location | undefined => {
  let nearestPlace: Location | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  (locations as Location[]).forEach((location) => {
    const distance = getDistance(
      { latitude, longitude },
      { latitude: location.latitude, longitude: location.longitude }
    );

    if (distance < nearestDistance) {
      nearestPlace = location;
      nearestDistance = distance;
    }
  });

  return nearestDistance <= maxDistance * 1000 ? nearestPlace : undefined;
};

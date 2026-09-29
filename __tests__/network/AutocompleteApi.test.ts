import getAutocomplete from '../../src/network/AutocompleteApi';

const mockAxiosClient = jest.fn();
const mockConfigGet = jest.fn();
const mockTrackMatomoEvent = jest.fn();

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@utils/axiosClient', () => ({
  __esModule: true,
  default: (...args: any[]) => mockAxiosClient(...args),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
  },
}));

const location = {
  area: 'Uusimaa',
  country: 'FI',
  feature: 'PPLC',
  id: 658225,
  lat: 60.17,
  lon: 24.94,
  name: 'Helsinki',
  population: 650000,
  timezone: 'Europe/Helsinki',
};

const autocomplete = {
  'found-results': 1,
  'max-results': 100,
  result: [location],
};

describe('AutocompleteApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockReset();
    mockConfigGet.mockReturnValue({
      apiUrl: 'https://example.test/autocomplete',
      keyword: 'place',
    });
  });

  it('fetches autocomplete with language, pattern and app identity params', async () => {
    mockAxiosClient.mockResolvedValueOnce({ data: { autocomplete } });

    await expect(getAutocomplete('hel')).resolves.toEqual({ autocomplete });
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();

    expect(mockAxiosClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.test/autocomplete',
        params: expect.objectContaining({
          keyword: 'place',
          lang: 'en',
          pattern: 'hel',
          who: expect.stringContaining('MobileWeather-'),
        }),
      }),
      expect.any(AbortController),
      'Autocomplete'
    );
  });

  it('accepts an empty result', async () => {
    const data = {
      autocomplete: { ...autocomplete, 'found-results': 0, result: [] },
    };
    mockAxiosClient.mockResolvedValueOnce({ data });

    await expect(getAutocomplete('hel')).resolves.toEqual(data);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it('skips validation when schemaValidation is false', async () => {
    mockConfigGet.mockReturnValue({
      apiUrl: 'https://example.test/autocomplete',
      keyword: 'place',
      schemaValidation: false,
    });
    const data = { autocomplete: { result: [] } };
    mockAxiosClient.mockResolvedValueOnce({ data });

    await expect(getAutocomplete('hel')).resolves.toBe(data);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it.each([true, undefined, null, 0, 'false'])(
    'validates when schemaValidation is %j',
    async (schemaValidation) => {
      mockConfigGet.mockReturnValue({
        apiUrl: 'https://example.test/autocomplete',
        keyword: 'place',
        schemaValidation,
      });
      mockAxiosClient.mockResolvedValueOnce({
        data: { autocomplete: { result: [] } },
      });

      await expect(getAutocomplete('hel')).rejects.toThrow(
        'Autocomplete validation failed:'
      );
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'Autocomplete',
        expect.stringContaining('Autocomplete validation failed:')
      );
    }
  );

  it.each<[string, unknown]>([
    ['null response', null],
    ['missing data', undefined],
    ['missing autocomplete', {}],
    ['unexpected response property', { autocomplete, unexpected: true }],
    ['missing result metadata', { autocomplete: { result: [] } }],
    ['negative result count', { autocomplete: { ...autocomplete, 'found-results': -1 } }],
    ['excessive result limit', { autocomplete: { ...autocomplete, 'max-results': 101 } }],
    ['non-array results', { autocomplete: { ...autocomplete, result: {} } }],
    ['excessive results', { autocomplete: { ...autocomplete, result: Array(101).fill(location) } }],
    ...[
      ['missing required fields', { name: 'Helsinki' }],
      ['incorrect field type', { ...location, id: '658225' }],
      ['latitude out of range', { ...location, lat: 91 }],
      ['longitude out of range', { ...location, lon: -181 }],
      ['invalid country code', { ...location, country: 'fi' }],
      ['negative population', { ...location, population: -1 }],
      ['empty name', { ...location, name: '' }],
      ['empty timezone', { ...location, timezone: '' }],
      ['unexpected location field', { ...location, unexpected: 1 }],
    ].map(([description, invalidLocation]): [string, unknown] => [
      description as string,
      { autocomplete: { ...autocomplete, result: [location, invalidLocation] } },
    ]),
  ])('rejects %s and tracks the validation error', async (_description, data) => {
    mockAxiosClient.mockResolvedValueOnce({ data });
    const result = getAutocomplete('hel');

    await expect(result).rejects.toThrow('Autocomplete validation failed:');
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Autocomplete',
      expect.stringContaining('Autocomplete validation failed:')
    );
    await expect(result).rejects.toThrow(mockTrackMatomoEvent.mock.calls[0][2]);
  });
});

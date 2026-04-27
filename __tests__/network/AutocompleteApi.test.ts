import getAutocomplete from '../../src/network/AutocompleteApi';

const mockAxiosClient = jest.fn();
const mockConfigGet = jest.fn();

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

describe('AutocompleteApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      apiUrl: 'https://example.test/autocomplete',
      keyword: 'place',
    });
  });

  it('fetches autocomplete with language, pattern and app identity params', async () => {
    mockAxiosClient.mockResolvedValueOnce({ data: { results: [] } });

    await expect(getAutocomplete('hel')).resolves.toEqual({ results: [] });

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
});

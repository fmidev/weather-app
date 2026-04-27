import getWarnings from '../../src/network/WarningsApi';

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

describe('WarningsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      apiUrl: { FI: 'https://warnings.example/fi' },
    });
  });

  it('fetches warnings by location and country', async () => {
    mockAxiosClient.mockResolvedValueOnce({ data: { data: { days: [] } } });

    await expect(
      getWarnings({ lat: 60.1, lon: 24.9, country: 'FI' } as any)
    ).resolves.toEqual({ data: { days: [] } });

    expect(mockAxiosClient).toHaveBeenCalledWith(
      {
        url: 'https://warnings.example/fi',
        params: expect.objectContaining({
          latlon: '60.1,24.9',
          lang: 'en',
          who: expect.stringContaining('MobileWeather-'),
        }),
      },
      undefined,
      'Warnings'
    );
  });
});

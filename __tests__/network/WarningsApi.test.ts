import getWarnings from '../../src/network/WarningsApi';

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

const warning = {
  type: 'wind',
  language: 'en',
  severity: 'moderate',
  description: 'Strong wind',
  duration: {
    startTime: '2026-09-18T12:00:00Z',
    endTime: '2026-09-19T12:00:00Z',
  },
};

const warningsData = {
  updated: '2026-09-18T12:00:00Z',
  warnings: [warning],
  startTime: '2026-09-18T12:00:00Z',
  endTime: '2026-09-19T12:00:00Z',
};

const location = { lat: 60.1, lon: 24.9, country: 'FI' } as any;

describe('WarningsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockReset();
    mockConfigGet.mockReturnValue({
      apiUrl: { FI: 'https://warnings.example/fi' },
    });
  });

  it('fetches warnings by location and country', async () => {
    mockAxiosClient.mockResolvedValueOnce({ data: { data: warningsData } });

    await expect(getWarnings(location)).resolves.toEqual({ data: warningsData });
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();

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

  it.each([
    ['empty warnings', { ...warningsData, warnings: [] }],
    [
      'optional physical properties',
      { ...warningsData, warnings: [{ ...warning, physical: { windSpeed: 20 } }] },
    ],
    ['timezone offset', { ...warningsData, updated: '2026-09-18T15:00:00+03:00' }],
  ])('accepts %s', async (_description, data) => {
    mockAxiosClient.mockResolvedValueOnce({ data: { data } });

    await expect(getWarnings(location)).resolves.toEqual({ data });
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it.each<[string, unknown]>([
    ['null response', null],
    ['missing data', undefined],
    ['missing wrapper', warningsData],
    ['missing required fields', { data: { warnings: [] } }],
    ['unexpected property', { data: warningsData, unexpected: true }],
    ['non-array warnings', { data: { ...warningsData, warnings: {} } }],
    [
      'more than 500 warnings',
      { data: { ...warningsData, warnings: Array(501).fill(warning) } },
    ],
    ...['updated', 'startTime', 'endTime'].map((field): [string, unknown] => [
      `invalid ${field}`,
      { data: { ...warningsData, [field]: '2026-02-30T12:00:00Z' } },
    ]),
    ...[
      ['missing warning fields', { type: 'wind' }],
      ['incorrect severity type', { ...warning, severity: 2 }],
      ['long description', { ...warning, description: 'x'.repeat(1001) }],
      ['unexpected warning property', { ...warning, unexpected: true }],
      ['invalid physical properties', { ...warning, physical: [] }],
      ['missing duration end', { ...warning, duration: { startTime: warning.duration.startTime } }],
      ['invalid duration start', { ...warning, duration: { ...warning.duration, startTime: 'invalid' } }],
      ['duration end without timezone', { ...warning, duration: { ...warning.duration, endTime: '2026-09-19T12:00:00' } }],
    ].map(([description, invalidWarning]): [string, unknown] => [
      description as string,
      { data: { ...warningsData, warnings: [warning, invalidWarning] } },
    ]),
  ])('rejects %s and tracks the validation error', async (_description, data) => {
    mockAxiosClient.mockResolvedValueOnce({ data });
    const result = getWarnings(location);

    await expect(result).rejects.toThrow('Warnings validation failed:');
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Warnings',
      expect.stringContaining('Warnings validation failed:')
    );
    await expect(result).rejects.toThrow(mockTrackMatomoEvent.mock.calls[0][2]);
  });
});

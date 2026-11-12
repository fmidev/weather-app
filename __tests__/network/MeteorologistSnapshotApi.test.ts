import getMeteorologistSnapshot from '../../src/network/MeteorologistSnapshotApi';

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

const snapshot = {
  title: 'Snapshot',
  text: 'Text',
  hasAlert: false,
  date: '2026-09-18T12:00:00Z',
};

describe('MeteorologistSnapshotApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockReset();
    mockConfigGet.mockReturnValue({
      meteorologist: { url: 'https://weather.example/snapshot' },
    });
  });

  it('fetches meteorologist snapshot', async () => {
    mockAxiosClient.mockResolvedValueOnce({
      data: snapshot,
    });

    await expect(getMeteorologistSnapshot()).resolves.toEqual(snapshot);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://weather.example/snapshot' },
      undefined,
      'Snapshot'
    );
  });

  it('accepts an alert with a timezone offset', async () => {
    const data = {
      ...snapshot,
      hasAlert: true,
      date: '2026-09-18T15:00:00+03:00',
    };
    mockAxiosClient.mockResolvedValueOnce({ data });

    await expect(getMeteorologistSnapshot()).resolves.toEqual(data);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it.each<[string, unknown]>([
    ['null response', null],
    ['missing data', undefined],
    ['array response', []],
    ['missing required fields', { title: 'Snapshot', text: 'Text' }],
    ['incorrect title type', { ...snapshot, title: 123 }],
    ['incorrect text type', { ...snapshot, text: null }],
    ['incorrect alert type', { ...snapshot, hasAlert: 'false' }],
    ['title longer than 100 characters', { ...snapshot, title: 'x'.repeat(101) }],
    ['text longer than 1000 characters', { ...snapshot, text: 'x'.repeat(1001) }],
    ['invalid date', { ...snapshot, date: 'invalid' }],
    ['nonexistent date', { ...snapshot, date: '2026-02-30T12:00:00Z' }],
    ['date without time', { ...snapshot, date: '2026-09-18' }],
    ['date without timezone', { ...snapshot, date: '2026-09-18T12:00:00' }],
    ['unexpected property', { ...snapshot, unexpected: true }],
  ])('rejects %s and tracks the validation error', async (_description, data) => {
    mockAxiosClient.mockResolvedValueOnce({ data });
    const result = getMeteorologistSnapshot();

    await expect(result).rejects.toThrow('Meteorologist snapshot validation failed:');
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Snapshot',
      expect.stringContaining('Meteorologist snapshot validation failed:')
    );
    await expect(result).rejects.toThrow(mockTrackMatomoEvent.mock.calls[0][2]);
  });

  it('rejects missing url', async () => {
    mockConfigGet.mockReturnValue({ meteorologist: {} });

    await expect(getMeteorologistSnapshot()).rejects.toThrow(
      'Meteorologist URL is not defined'
    );
  });
});

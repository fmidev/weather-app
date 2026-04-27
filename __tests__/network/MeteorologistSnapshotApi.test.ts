import getMeteorologistSnapshot from '../../src/network/MeteorologistSnapshotApi';

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

describe('MeteorologistSnapshotApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      meteorologist: { url: 'https://weather.example/snapshot' },
    });
  });

  it('fetches meteorologist snapshot', async () => {
    mockAxiosClient.mockResolvedValueOnce({
      data: { title: 'Snapshot', text: 'Text' },
    });

    await expect(getMeteorologistSnapshot()).resolves.toEqual({
      title: 'Snapshot',
      text: 'Text',
    });
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://weather.example/snapshot' },
      undefined,
      'Snapshot'
    );
  });

  it('rejects missing url', async () => {
    mockConfigGet.mockReturnValue({ meteorologist: {} });

    await expect(getMeteorologistSnapshot()).rejects.toThrow(
      'Meteorologist URL is not defined'
    );
  });
});

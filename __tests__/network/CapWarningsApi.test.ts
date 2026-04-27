import getCapWarnings from '../../src/network/CapWarningsApi';

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

describe('CapWarningsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      capViewSettings: {
        datasources: [{ url: 'https://warnings.example/feed.xml' }],
      },
    });
  });

  it('fetches and filters CAP warnings from feed links', async () => {
    const feed = `
      <feed>
        <updated>2035-01-01T00:00:00Z</updated>
        <entry>
          <link href="http://warnings.example/keep.xml" type="application/cap+xml" />
          <link href="http://warnings.example/keep.html" type="text/html" />
        </entry>
        <entry>
          <link href="http://warnings.example/expired.xml" type="application/cap+xml" />
        </entry>
      </feed>
    `;
    const keepAlert = `
      <alert>
        <identifier>keep</identifier>
        <status>Actual</status>
        <msgType>Alert</msgType>
        <scope>Public</scope>
        <info>
          <category>Met</category>
          <urgency>Immediate</urgency>
          <expires>2099-01-01T00:00:00Z</expires>
          <area><polygon>1,1 2,2 3,3</polygon></area>
        </info>
      </alert>
    `;
    const expiredAlert = `
      <alert>
        <identifier>expired</identifier>
        <status>Actual</status>
        <msgType>Alert</msgType>
        <scope>Public</scope>
        <info>
          <category>Met</category>
          <urgency>Immediate</urgency>
          <expires>2000-01-01T00:00:00Z</expires>
          <area><polygon>1,1 2,2 3,3</polygon></area>
        </info>
      </alert>
    `;

    mockAxiosClient
      .mockResolvedValueOnce({ data: feed })
      .mockResolvedValueOnce({ data: keepAlert })
      .mockResolvedValueOnce({ data: expiredAlert });

    await expect(getCapWarnings()).resolves.toEqual({
      updated: '2035-01-01T00:00:00Z',
      warnings: [expect.objectContaining({ identifier: 'keep' })],
    });
    expect(mockAxiosClient).toHaveBeenNthCalledWith(2, {
      url: 'https://warnings.example/keep.xml',
    });
  });
});

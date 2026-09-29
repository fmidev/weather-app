import getAnnouncements from '../../src/network/AnnouncementsApi';

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

const announcement = {
  id: 'a1',
  type: 'Maintenance',
  content: 'Scheduled maintenance',
  link: 'https://example.test/maintenance',
};

describe('AnnouncementsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockReset();
    mockConfigGet.mockReturnValue({
      enabled: true,
      api: { en: 'https://example.test/announcements-en.json' },
    });
  });

  it('fetches announcements when enabled', async () => {
    mockAxiosClient.mockResolvedValueOnce({
      data: [announcement],
    });

    await expect(getAnnouncements()).resolves.toEqual([announcement]);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://example.test/announcements-en.json' },
      undefined,
      'Announcements'
    );
  });

  it('accepts crisis announcements and an empty list', async () => {
    const data = [{ ...announcement, type: 'Crisis' }];
    mockAxiosClient.mockResolvedValueOnce({ data });
    await expect(getAnnouncements()).resolves.toEqual(data);

    mockAxiosClient.mockResolvedValueOnce({ data: [] });
    await expect(getAnnouncements()).resolves.toEqual([]);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it.each<[string, unknown]>([
    ['null response', null],
    ['missing data', undefined],
    ['object response', announcement],
    ['missing required fields', [{ id: 'a1' }]],
    ['incorrect id type', [{ ...announcement, id: 1 }]],
    ['unknown announcement type', [{ ...announcement, type: 'Other' }]],
    ['incorrect content type', [{ ...announcement, content: null }]],
    ['invalid link', [{ ...announcement, link: 'invalid' }]],
    ['relative link', [{ ...announcement, link: '/maintenance' }]],
    ['id longer than 100 characters', [{ ...announcement, id: 'x'.repeat(101) }]],
    [
      'content longer than 1000 characters',
      [{ ...announcement, content: 'x'.repeat(1001) }],
    ],
    [
      'link longer than 1000 characters',
      [{ ...announcement, link: `https://example.test/${'x'.repeat(1000)}` }],
    ],
    ['unexpected property', [{ ...announcement, unexpected: true }]],
    ['invalid item after a valid item', [announcement, { id: 'a2' }]],
  ])('rejects %s and tracks the validation error', async (_description, data) => {
    mockAxiosClient.mockResolvedValueOnce({ data });
    const result = getAnnouncements();

    await expect(result).rejects.toThrow('Announcements validation failed:');
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Announcements',
      expect.stringContaining('Announcements validation failed:')
    );
    await expect(result).rejects.toThrow(mockTrackMatomoEvent.mock.calls[0][2]);
  });

  it('skips validation only when schemaValidation is false', async () => {
    mockConfigGet.mockReturnValue({
      enabled: true,
      api: { en: 'https://example.test/announcements-en.json' },
      schemaValidation: false,
    });
    const data = [{ id: 'a1' }];
    mockAxiosClient.mockResolvedValueOnce({ data });

    await expect(getAnnouncements()).resolves.toBe(data);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it.each([true, undefined, null, 0, 'false'])(
    'validates when schemaValidation is %j',
    async (schemaValidation) => {
      mockConfigGet.mockReturnValue({
        enabled: true,
        api: { en: 'https://example.test/announcements-en.json' },
        schemaValidation,
      });
      mockAxiosClient.mockResolvedValueOnce({ data: [{ id: 'a1' }] });

      await expect(getAnnouncements()).rejects.toThrow(
        'Announcements validation failed:'
      );
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'Announcements',
        expect.stringContaining('Announcements validation failed:')
      );
    }
  );

  it('returns an empty list when announcements are disabled', async () => {
    mockConfigGet.mockReturnValue({ enabled: false, api: {} });

    await expect(getAnnouncements()).resolves.toEqual([]);
    expect(mockAxiosClient).not.toHaveBeenCalled();
  });
});

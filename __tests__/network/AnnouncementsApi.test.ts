import getAnnouncements from '../../src/network/AnnouncementsApi';

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

describe('AnnouncementsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      enabled: true,
      api: { en: 'https://example.test/announcements-en.json' },
    });
  });

  it('fetches announcements when enabled', async () => {
    mockAxiosClient.mockResolvedValueOnce({
      data: [{ id: 'a1', title: 'Announcement' }],
    });

    await expect(getAnnouncements()).resolves.toEqual([
      { id: 'a1', title: 'Announcement' },
    ]);
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://example.test/announcements-en.json' },
      undefined,
      'Announcements'
    );
  });

  it('returns an empty list when announcements are disabled', async () => {
    mockConfigGet.mockReturnValue({ enabled: false, api: {} });

    await expect(getAnnouncements()).resolves.toEqual([]);
    expect(mockAxiosClient).not.toHaveBeenCalled();
  });
});

import getNews from '../../src/network/NewsApi';

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

const newsItem = {
  sys: {
    id: '1',
    createdAt: '2035-01-01T12:00:00Z',
    updatedAt: '2035-01-02T12:00:00Z',
  },
  fields: {
    title: 'News title',
    type: 'article',
    site: 'en',
  },
};

describe('NewsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockReset();
    mockConfigGet.mockReturnValue({
      apiUrl: { en: 'https://news.example/items' },
      numberOfNews: 2,
    });
  });

  it('fetches news with limit and maps validated items with extra metadata', async () => {
    mockAxiosClient.mockResolvedValueOnce({
      data: {
        total: 1,
        items: [
          {
            sys: { ...newsItem.sys, revision: 2 },
            fields: {
              ...newsItem.fields,
              body: 'Article content',
              showEditedDatetime: true,
              thumbnail: {
                fields: {
                  image: {
                    fields: {
                      altText: 'Alt',
                      file: { url: '//images.example/image.jpg' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    await expect(getNews('en')).resolves.toEqual([
      {
        id: '1',
        title: 'News title',
        type: 'article',
        imageUrl: 'https://images.example/image.jpg',
        imageAlt: 'Alt',
        createdAt: newsItem.sys.createdAt,
        updatedAt: newsItem.sys.updatedAt,
        language: 'en',
        showEditedDateTime: true,
      },
    ]);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://news.example/items?limit=2' },
      undefined,
      'News'
    );
  });

  it.each([
    undefined,
    null,
    {},
    { fields: null },
    { fields: {} },
    { fields: { image: null } },
  ])('maps news without an image in thumbnail %j', async (thumbnail) => {
    mockAxiosClient.mockResolvedValueOnce({
      data: {
        items: [{ ...newsItem, fields: { ...newsItem.fields, thumbnail } }],
      },
    });

    await expect(getNews('en')).resolves.toEqual([
      {
        id: newsItem.sys.id,
        title: newsItem.fields.title,
        type: newsItem.fields.type,
        imageUrl: null,
        imageAlt: '',
        createdAt: newsItem.sys.createdAt,
        updatedAt: newsItem.sys.updatedAt,
        language: newsItem.fields.site,
        showEditedDateTime: false,
      },
    ]);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it('accepts an empty news list', async () => {
    mockAxiosClient.mockResolvedValueOnce({ data: { items: [] } });

    await expect(getNews('en')).resolves.toEqual([]);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it.each<[string, unknown]>([
    ['null response', null],
    ['missing items', {}],
    ['non-array items', { items: {} }],
    ['missing required fields', { items: [{ sys: { id: '1' }, fields: {} }] }],
    [
      'invalid item after a valid item',
      { items: [newsItem, { sys: { id: '2' }, fields: {} }] },
    ],
    [
      'invalid timestamp',
      {
        items: [
          { ...newsItem, sys: { ...newsItem.sys, createdAt: 'invalid' } },
        ],
      },
    ],
    [
      'incomplete image',
      {
        items: [
          {
            ...newsItem,
            fields: {
              ...newsItem.fields,
              thumbnail: { fields: { image: {} } },
            },
          },
        ],
      },
    ],
    [
      'invalid image URL',
      {
        items: [
          {
            ...newsItem,
            fields: {
              ...newsItem.fields,
              thumbnail: {
                fields: {
                  image: {
                    fields: {
                      altText: '',
                      file: { url: '//images.example/invalid image.jpg' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    ],
  ])(
    'rejects %s and tracks the validation error',
    async (_description, data) => {
      mockAxiosClient.mockResolvedValueOnce({ data });
      const result = getNews('en');

      await expect(result).rejects.toThrow('News validation failed:');
      expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'News',
        expect.stringContaining('News validation failed:')
      );
      await expect(result).rejects.toThrow(
        mockTrackMatomoEvent.mock.calls[0][2]
      );
    }
  );

  it('rejects missing news api url', async () => {
    mockConfigGet.mockReturnValue({ apiUrl: {}, numberOfNews: 2 });

    await expect(getNews('fi')).rejects.toThrow('News API url is not defined');
  });
});

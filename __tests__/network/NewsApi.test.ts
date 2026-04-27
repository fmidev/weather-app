import getNews from '../../src/network/NewsApi';

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

describe('NewsApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      apiUrl: { en: 'https://news.example/items' },
      numberOfNews: 2,
    });
  });

  it('fetches news with limit and maps valid items only', async () => {
    mockAxiosClient.mockResolvedValueOnce({
      data: {
        items: [
          {
            sys: {
              id: '1',
              createdAt: '2035-01-01',
              updatedAt: '2035-01-02',
            },
            fields: {
              title: 'News title',
              type: 'article',
              site: 'en',
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
          { sys: { id: 'missing-fields' }, fields: {} },
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
        createdAt: '2035-01-01',
        updatedAt: '2035-01-02',
        language: 'en',
        showEditedDateTime: true,
      },
    ]);
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://news.example/items?limit=2' },
      undefined,
      'News'
    );
  });

  it('rejects missing news api url', async () => {
    mockConfigGet.mockReturnValue({ apiUrl: {}, numberOfNews: 2 });

    await expect(getNews('fi')).rejects.toThrow('News API url is not defined');
  });
});

import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import newsSchema from '../../src/schemas/news.schema.json';

const ajv = new Ajv();
addFormats(ajv, ['date-time', 'uri-reference']);
const validateNews = ajv.compile(newsSchema);

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

const imageFields = {
  altText: 'Weather map',
  file: { url: '//images.example/image.jpg' },
};

const withThumbnail = (thumbnail: unknown) => ({
  items: [{ ...newsItem, fields: { ...newsItem.fields, thumbnail } }],
});

describe('news response schema', () => {
  it('accepts news without an image and an empty response', () => {
    expect(validateNews({ items: [newsItem] })).toBe(true);
    expect(validateNews({ items: [] })).toBe(true);
  });

  it('accepts news with an image, edited flag and extra metadata', () => {
    expect(
      validateNews({
        total: 1,
        items: [
          {
            ...newsItem,
            sys: { ...newsItem.sys, revision: 2 },
            fields: {
              ...newsItem.fields,
              body: 'Article content',
              showEditedDatetime: true,
              thumbnail: { fields: { image: { fields: imageFields } } },
            },
          },
        ],
      })
    ).toBe(true);
  });

  it.each([
    null,
    {},
    { fields: null },
    { fields: {} },
    { fields: { image: null } },
  ])('accepts an absent image in thumbnail %j', (thumbnail) => {
    expect(validateNews(withThumbnail(thumbnail))).toBe(true);
  });

  it.each<[string, unknown]>([
    ['null response', null],
    ['missing items', {}],
    ['non-array items', { items: {} }],
    ['null item', { items: [null] }],
    ['missing sys', { items: [{ fields: newsItem.fields }] }],
    ['missing fields', { items: [{ sys: newsItem.sys }] }],
    ['missing required fields', { items: [{ ...newsItem, fields: {} }] }],
    [
      'empty title',
      { items: [{ ...newsItem, fields: { ...newsItem.fields, title: '' } }] },
    ],
    [
      'incorrect edited flag type',
      {
        items: [
          {
            ...newsItem,
            fields: { ...newsItem.fields, showEditedDatetime: 'true' },
          },
        ],
      },
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
      'timestamp without time',
      {
        items: [
          { ...newsItem, sys: { ...newsItem.sys, updatedAt: '2035-01-02' } },
        ],
      },
    ],
    ['missing image fields', withThumbnail({ fields: { image: {} } })],
    [
      'missing image file',
      withThumbnail({ fields: { image: { fields: { altText: '' } } } }),
    ],
    [
      'missing image alt text',
      withThumbnail({
        fields: { image: { fields: { file: imageFields.file } } },
      }),
    ],
    [
      'absolute image URL',
      withThumbnail({
        fields: {
          image: {
            fields: {
              ...imageFields,
              file: { url: 'https://images.example/image.jpg' },
            },
          },
        },
      }),
    ],
    [
      'invalid image URL',
      withThumbnail({
        fields: {
          image: {
            fields: {
              ...imageFields,
              file: { url: '//images.example/invalid image.jpg' },
            },
          },
        },
      }),
    ],
  ])('rejects %s', (_description, data) => {
    expect(validateNews(data)).toBe(false);
  });
});

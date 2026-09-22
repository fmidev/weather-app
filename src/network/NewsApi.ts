import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { Config } from '@config';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';
import { NewsItem } from '@store/news/types';
import newsSchema from '../schemas/news.schema.json';

interface NewsResponse {
  items: {
    sys: {
      id: string;
      createdAt: string;
      updatedAt: string;
    };
    fields: {
      title: string;
      type: string;
      site: string;
      showEditedDatetime?: boolean;
      thumbnail?: {
        fields?: {
          image?: {
            fields: {
              altText: string;
              file: { url: string };
            };
          } | null;
        } | null;
      } | null;
    };
  }[];
}

const ajv = new Ajv();
addFormats(ajv, ['date-time', 'uri-reference']);
const validateNews = ajv.compile<NewsResponse>(newsSchema);

const getNews = async (language: string): Promise<NewsItem[]> => {
  const { apiUrl, numberOfNews, schemaValidation } = Config.get('news');

  if (!apiUrl || !apiUrl[language]) {
    return Promise.reject(new Error('News API url is not defined'));
  }

  const url = `${apiUrl[language]}${apiUrl[language].includes('?') ? `&limit=${numberOfNews}` : `?limit=${numberOfNews}`}`;
  const { data }: { data: NewsResponse } = await axiosClient(
    { url },
    undefined,
    'News'
  );

  if (schemaValidation !== false && !validateNews(data)) {
    const error = `News validation failed: ${ajv.errorsText(
      validateNews.errors
    )}\n`;
    console.error(error);
    trackMatomoEvent('Error', 'News', error);
    throw new Error(error);
  }

  const newsItems = data.items.map((item): NewsItem => {
    const image = item.fields.thumbnail?.fields?.image;

    return {
      id: item.sys.id,
      title: item.fields.title,
      type: item.fields.type,
      imageUrl: image ? `https:${image.fields.file.url}` : null,
      imageAlt: image ? image.fields.altText : '',
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
      language: item.fields.site,
      showEditedDateTime: item.fields.showEditedDatetime === true,
    };
  });

  return newsItems;
};

export default getNews;

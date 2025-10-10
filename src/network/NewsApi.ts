import { Config } from '@config';
import axiosClient from '@utils/axiosClient';
import { NewsItem } from '@store/news/types';

const getNews = async (language: string): Promise<NewsItem[]> => {
  const { apiUrl, numberOfNews } = Config.get('news');

  if (!apiUrl || !apiUrl[language]) {
    return Promise.reject(new Error('News API url is not defined'));
  }

  const url = `${apiUrl[language]}${apiUrl[language].includes('?') ? `&limit=${numberOfNews}` : `?limit=${numberOfNews}`}`;
  const { data } = await axiosClient({ url }, undefined, 'News');

  const newsItems = data.items.flatMap((item:any):NewsItem | [] => {
    if (!item.sys?.id || !item.fields?.title || !item.fields?.type
       || !item.sys?.createdAt || !item.sys?.updatedAt || !item.fields?.site
    ) {
      return [];
    }

    const imageMissing = !item.fields?.thumbnail?.fields?.image;

    return {
      id: item.sys.id,
      title: item.fields.title,
      type: item.fields.type,
      imageUrl: imageMissing ? null : 'https:' + item.fields.thumbnail.fields.image.fields.file.url,
      imageAlt: imageMissing ? '' : item.fields.thumbnail.fields.image.fields.altText,
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
      language: item.fields.site,
      showEditedDateTime: item.fields.showEditedDatetime ?? true,
    };
  });

  return newsItems;
};

export default getNews;

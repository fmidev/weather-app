import { Config } from '@config';
import axiosClient from '@utils/axiosClient';
import { NewsItem } from '@store/news/types';

const getNews = async (language: string): Promise<NewsItem[]> => {
  const { apiUrl, numberOfNews } = Config.get('news');

  if (!apiUrl || !apiUrl[language]) {
    return Promise.reject(new Error('News API url is not defined'));
  }

  const url = apiUrl[language]+`?limit=${numberOfNews}`;
  const { data } = await axiosClient({ url });

  const newsItems = data.items.map((item:any):NewsItem => {
    return {
      id: item.sys.id,
      title: item.fields.title,
      type: item.fields.type,
      imageUrl: 'https:' + item.fields.thumbnail.fields.image.fields.file.url,
      imageAlt: item.fields.thumbnail.fields.image.fields.altText,
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
      language: item.fields.site
    };
  });

  return newsItems;
};

export default getNews;

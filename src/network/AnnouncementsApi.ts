import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { Announcement } from '@store/announcements/types';

const getAnnouncements = async (): Promise<{ data: Announcement[] }> => {
  const { language } = i18n;
  const { api } = Config.get('announcements');

  const url = api[language];

  const { data } = await axiosClient({ url });

  return data;
};

export default getAnnouncements;

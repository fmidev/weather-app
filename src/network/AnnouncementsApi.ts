import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { Announcement } from '@store/announcements/types';

const getAnnouncements = async (): Promise<Announcement[]> => {
  const { language } = i18n;
  const { api, enabled } = Config.get('announcements');

  if (!enabled) return [];

  const url = api[language];

  if (!url) return [];

  const { data } = await axiosClient({ url });

  return data;
};

export default getAnnouncements;

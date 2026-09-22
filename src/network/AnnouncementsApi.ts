import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';
import { Announcement } from '@store/announcements/types';
import announcementsSchema from '../schemas/announcements.schema.json';

const ajv = new Ajv();
addFormats(ajv, ['uri']);
const validateAnnouncements = ajv.compile<Announcement[]>(announcementsSchema);

const getAnnouncements = async (): Promise<Announcement[]> => {
  const { language } = i18n;
  const { api, enabled, schemaValidation } = Config.get('announcements');

  if (!enabled || !api || !api[language]) return [];

  const url = api[language];

  const { data } = await axiosClient({ url }, undefined, 'Announcements');

  if (schemaValidation !== false && !validateAnnouncements(data)) {
    const error = `Announcements validation failed: ${ajv.errorsText(
      validateAnnouncements.errors
    )}\n`;
    trackMatomoEvent('Error', 'Announcements', error);
    throw new Error(error);
  }

  return data;
};

export default getAnnouncements;

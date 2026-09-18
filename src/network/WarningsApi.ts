import { Platform } from 'react-native';
import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { Config } from '@config';
import i18n from '@i18n';
import { Location } from '@store/location/types';
import { WarningsData } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';
import packageJSON from '../../package.json';
import weatherWarningsSchema from '../schemas/weather-warnings.schema.json';

const ajv = new Ajv();
addFormats(ajv, ['date-time']);
const validateWarnings = ajv.compile<{ data: WarningsData }>(
  weatherWarningsSchema
);

const getWarnings = async ({
  lat,
  lon,
  country,
}: Location): Promise<{ data: WarningsData }> => {
  const { language } = i18n;
  const { apiUrl } = Config.get('warnings');

  const url = apiUrl?.[country];

  const params = {
    latlon: `${lat},${lon}`,
    lang: language,
    who: `${packageJSON.name}-${Platform.OS}`,
  };

  const { data } = await axiosClient({ url, params }, undefined, 'Warnings');

  if (!validateWarnings(data)) {
    const error = `Warnings validation failed: ${ajv.errorsText(
      validateWarnings.errors
    )}\n`;
    trackMatomoEvent('Error', 'Warnings', error);
    throw new Error(error);
  }

  return data;
};

export default getWarnings;

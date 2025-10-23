import { Platform } from 'react-native';
import { Config } from '@config';
import i18n from '@i18n';
import { Location } from '@store/location/types';
import { WarningsData } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import packageJSON from '../../package.json';

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

  return data;
};

export default getWarnings;

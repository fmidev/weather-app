import { Config } from '@config';
import i18n from '@i18n';
import { Location } from '@store/location/types';
import { WarningsData } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';

const getWarnings = async ({
  lat,
  lon,
  country,
}: Location): Promise<WarningsData> => {
  const { language } = i18n;
  const { apiUrl } = Config.get('warnings');

  const url = apiUrl?.[country];

  const params = {
    latlon: `${lat},${lon}`,
    lang: language,
  };

  const { data } = await axiosClient({ url, params });

  return data;
};

export default getWarnings;

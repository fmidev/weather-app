import { AutoComplete } from '@store/location/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';

const getAutocomplete = async (pattern: string): Promise<AutoComplete> => {
  const { keyword, apiUrl } = Config.get('location');
  const { language } = i18n;

  const params = {
    keyword,
    language,
    pattern,
  };

  const { data } = await axiosClient({ url: apiUrl, params });

  return data;
};

export default getAutocomplete;

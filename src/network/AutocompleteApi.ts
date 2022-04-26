import { AutoComplete } from '@store/location/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import packageJSON from '../../package.json';

const getAutocomplete = async (pattern: string): Promise<AutoComplete> => {
  const { keyword, apiUrl } = Config.get('location');
  const { language } = i18n;

  const params = {
    keyword,
    lang: language,
    pattern,
    who: packageJSON.name,
  };

  const { data } = await axiosClient({ url: apiUrl, params });

  return data;
};

export default getAutocomplete;

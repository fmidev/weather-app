import axios from 'axios';

import { AutoComplete } from '@store/location/types';
import { Config } from '@config';

const getAutocomplete = async (pattern: string): Promise<AutoComplete> => {
  const { keyword, apiUrl } = Config.get('location');

  const params = {
    keyword,
    language: 'fi', // TODO
    pattern,
  };

  const { data } = await axios.get(apiUrl, {
    params,
  });
  return data;
};

export default getAutocomplete;

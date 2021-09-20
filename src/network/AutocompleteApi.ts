import axios from 'axios';
import Config from 'react-native-config';

import { AutoComplete } from '@store/location/types';

const getAutocomplete = async (pattern: string): Promise<AutoComplete> => {
  const params = {
    keyword: 'ajax_fi_all', // TODO
    language: 'fi', // TODO
    pattern,
  };

  const { data } = await axios.get(
    `https://data.fmi.fi/fmi-apikey/${Config.API_KEY}/autocomplete`,
    {
      params,
    }
  );
  return data;
};

export default getAutocomplete;

import { AutoComplete } from '@store/location/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import packageJSON from '../../package.json';
import axios, { type CancelTokenSource } from 'axios';

let autocompleteSource: CancelTokenSource | undefined;

const getAutocomplete = async (pattern: string): Promise<AutoComplete> => {
  const { keyword, apiUrl } = Config.get('location');
  const { language } = i18n;

  const params = {
    keyword,
    lang: language,
    pattern,
    who: packageJSON.name,
  };

  // Cancel the previous request to avoid multiple queries running same time
  if (autocompleteSource) {
    autocompleteSource.cancel(
      `New autocomplete request is sent with pattern ${pattern}`
    );
  }

  autocompleteSource = axios.CancelToken.source();

  const { data } = await axiosClient({
    url: apiUrl,
    params,
    cancelToken: autocompleteSource.token,
  });

  return data;
};

export default getAutocomplete;

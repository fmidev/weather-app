import { AutoComplete } from '@store/location/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import packageJSON from '../../package.json';

let abortController: AbortController | undefined;

const getAutocomplete = async (pattern: string): Promise<AutoComplete> => {
  const { keyword, apiUrl } = Config.get('location');
  const { language } = i18n;

  const params = {
    keyword,
    lang: language,
    pattern,
    who: `${packageJSON.name}-${Platform.OS}`,
  };

  // Cancel the previous request to avoid multiple queries running same time
  if (abortController) {
    abortController.abort(
      `New autocomplete request is sent with pattern ${pattern}`
    );
  }

  abortController = new AbortController();

  const { data } = await axiosClient(
    {
      url: apiUrl,
      params,
    },
    abortController
  );

  return data;
};

export default getAutocomplete;

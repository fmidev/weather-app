import { Platform } from 'react-native';
import Ajv from 'ajv/dist/2020';
import { AutoComplete } from '@store/location/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';
import packageJSON from '../../package.json';
import autocompleteSchema from '../schemas/timeseries-autocomplete.schema.json';

const ajv = new Ajv();
const validateAutocomplete = ajv.compile<AutoComplete>(autocompleteSchema);

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
    abortController.abort();
  }

  abortController = new AbortController();

  const { data } = await axiosClient(
    {
      url: apiUrl,
      params,
    },
    abortController,
    'Autocomplete'
  );

  if (!validateAutocomplete(data)) {
    const error = `Autocomplete validation failed: ${ajv.errorsText(
      validateAutocomplete.errors
    )}\n`;
    trackMatomoEvent('Error', 'Autocomplete', error);
    throw new Error(error);
  }

  return data;
};

export default getAutocomplete;

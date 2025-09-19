import Axios, { AxiosRequestConfig } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { trackMatomoEvent } from './matomo';
import { AnalyticActions } from '@config';

const instance = Axios.create();
const axios = setupCache(instance);

const getErrorMessage = (headers: Record<string, string>): string | undefined => {
  if (headers['x-timeseriesplugin-error']) {
    return headers['x-timeseriesplugin-error'];
  } else if(headers['x-wmsplugin-error']) {
    return headers['x-wmsplugin-error'];
  } else if(headers['x-autocompleteplugin-error']) {
    return headers['x-autocompleteplugin-error'];
  }
  return undefined;
};


const axiosClient = async (
  options: AxiosRequestConfig,
  abortController?: AbortController,
  analyticsAction?: AnalyticActions
) => {
  const { timeout = 20000 } = options;
  const controller = abortController || new AbortController();

  const requestConfig = {
    signal: controller.signal,
    cache: {
      cacheTakeover: false,
    },
    ...options,
  };
  delete requestConfig.timeout;

  let output: any;
  let timeoutId: any;

  const request = axios(requestConfig)
    .then((response) => {
      output = response;
      clearTimeout(timeoutId);
    })
    .catch((error) => {
      if(analyticsAction) {
        const errorMsg = getErrorMessage(error.response.headers);
        if(errorMsg) {
          // log error message from headers if available
          trackMatomoEvent('Error', analyticsAction, errorMsg);
        } else {
          // log error with analyticsAction
          trackMatomoEvent('Error', analyticsAction, error);
        }
      } else {
        // log error as not specified
        trackMatomoEvent('Error', 'Not specified', error);
      }

      clearTimeout(timeoutId);
      throw error;
    });

  timeoutId = setTimeout(
    () => controller.abort(`Timeout of ${timeout}ms exceeded`),
    timeout
  );

  await Promise.all([request]);
  return output;
};

export default axiosClient;

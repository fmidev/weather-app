import Axios, { AxiosRequestConfig } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { trackMatomoEvent } from './matomo';
import { AnalyticActions } from '@config';

const instance = Axios.create();
const axios = setupCache(instance);

const getErrorMessage = (headers: Record<string, string>): string | undefined => {
  const key = Object.keys(headers).find(k => /^x-(.+)-error$/i.test(k));
  return key ? headers[key] : undefined;
};

const axiosClient = async (
  options: AxiosRequestConfig,
  abortController?: AbortController,
  analyticsAction?: AnalyticActions,
  ignoreError400: boolean = false
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
      const action = analyticsAction ?? 'Not specified';

      if (error.code === 'ECONNABORTED') {
        trackMatomoEvent('Error', action, 'Timeout');
      } else if (error.response) {
        const errorMsg = getErrorMessage(error.response.headers);

        if(errorMsg) {
          // log error message from headers if available
          trackMatomoEvent('Error', action, `${error.response.status}: ${errorMsg}`);
        } else {
          // log error with analyticsAction
          trackMatomoEvent('Error', action, error);
        }
      } else {
        if(!ignoreError400) {
          // Disable this if causes too much noise
          trackMatomoEvent('Error', action, `Network error: ${error.message}`);
        }
      }

      clearTimeout(timeoutId);
      throw error;
    });

  timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  await Promise.all([request]);
  return output;
};

export default axiosClient;

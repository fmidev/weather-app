import Axios, { AxiosRequestConfig } from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
const axios = setupCache(instance);

const axiosClient = async (
  options: AxiosRequestConfig,
  abortController?: AbortController
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

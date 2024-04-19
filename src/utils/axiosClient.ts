import axios, { AxiosRequestConfig } from 'axios';

const axiosClient = async (options: AxiosRequestConfig) => {
  const { timeout = 20000 } = options;
  const source = axios.CancelToken.source();

  const requestConfig = {
    ...options,
    cancelToken: options.cancelToken || source.token,
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
    () => source.cancel(`Timeout of ${timeout}ms exceeded`),
    timeout
  );

  await Promise.all([request]);
  return output;
};

export default axiosClient;

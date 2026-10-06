const axios = require('axios');

// The React Native preset supplies a mock XMLHttpRequest. Use Axios's real
// Node HTTP transport so requests reach the configured production services.
const httpAdapter = axios.getAdapter('http');
/** @type {Array<{url: string | undefined, producer: string | undefined, params: Record<string, unknown> | undefined, status: number, data: unknown}>} */
const liveResponses = [];
/** @type {Array<{url: string | undefined, params: Record<string, unknown> | undefined, status: number | undefined, message: string}>} */
const liveFailures = [];
axios.defaults.adapter = async (options) => {
  let response;
  try {
    response = await httpAdapter(options);
  } catch (error) {
    // Search actions clear results on HTTP errors. Keep a sanitized diagnostic
    // so a live test cannot confuse an outage with a valid empty search.
    liveFailures.push({
      url: options.url, params: options.params,
      status: error.response?.status, message: error.message,
    });
    throw error;
  }
  // Observe actual responses, including the optional geomagnetic response
  // whose failures WeatherApi deliberately handles as a forecast fallback.
  liveResponses.push({
    url: options.url,
    producer: options.params?.producer,
    params: options.params,
    status: response.status,
    data: response.data,
  });
  return response;
};
axios.defaults.headers.common['Accept-Encoding'] = 'gzip';

module.exports = { liveResponses, liveFailures };

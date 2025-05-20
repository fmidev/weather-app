import { Config } from '@config';
import axiosClient from '@utils/axiosClient';
import { MeteorologistSnapshot } from '@store/meteorologist/types';

const getMeteorologistSnapshot = async (): Promise<MeteorologistSnapshot> => {
  const { meteorologist } = Config.get('weather');

  if (!meteorologist?.url) {
    return Promise.reject(new Error('Meteorologist URL is not defined'));
  }

  const url = meteorologist.url;
  const { data } = await axiosClient({ url });
  return data;
};

export default getMeteorologistSnapshot;

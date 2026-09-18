import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { Config } from '@config';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';
import { MeteorologistSnapshot } from '@store/meteorologist/types';
import meteorologistSnapshotSchema from '../schemas/meteorologist-snapshot.schema.json';

const ajv = new Ajv();
addFormats(ajv, ['date-time']);
const validateMeteorologistSnapshot = ajv.compile<MeteorologistSnapshot>(
  meteorologistSnapshotSchema
);

const getMeteorologistSnapshot = async (): Promise<MeteorologistSnapshot> => {
  const { meteorologist } = Config.get('weather');

  if (!meteorologist?.url) {
    return Promise.reject(new Error('Meteorologist URL is not defined'));
  }

  const url = meteorologist.url;
  const { data } = await axiosClient({ url }, undefined, 'Snapshot');

  if (!validateMeteorologistSnapshot(data)) {
    const error = `Meteorologist snapshot validation failed: ${ajv.errorsText(
      validateMeteorologistSnapshot.errors
    )}\n`;
    trackMatomoEvent('Error', 'Snapshot', error);
    throw new Error(error);
  }

  return data;
};

export default getMeteorologistSnapshot;

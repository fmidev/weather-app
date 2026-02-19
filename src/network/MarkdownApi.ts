import { Config } from '@config';
import axiosClient from '@utils/axiosClient';

export const getLayerDocumentation = async (layer: string, language: string): Promise<string> => {
  const { infoBottomSheet } = Config.get('map');

  if (!infoBottomSheet?.url) {
    return Promise.reject(new Error('Documentation URL is not defined'));
  }

  const convertedLayer = layer.replace(/:/g, '-');
  const url = infoBottomSheet.url.replace('{layer}', convertedLayer).replace('{lang}', language);

  const { data } = await axiosClient({ url }, undefined, 'Map');
  return data;
};

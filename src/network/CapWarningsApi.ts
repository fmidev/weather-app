import { Config } from '@config';
import { CapWarning } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import { parse } from 'fast-xml-parser';

const getCapWarnings = async () => {
  const { capViewSettings } = Config.get('warnings');

  const url = capViewSettings?.datasources[0]?.url;

  const results = await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8].map((num) =>
      axiosClient({ url: `${url}${num - 1}` })
    )
  );
  const parsedData: CapWarning[] = results.map(
    (result) => parse(result.data).alert
  );
  return parsedData;
};

export default getCapWarnings;

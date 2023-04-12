import { Config } from '@config';
import { CapWarning } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import { parse } from 'fast-xml-parser';

const getCapWarnings = async () => {
  const { capViewSettings } = Config.get('warnings');

  const url = capViewSettings?.datasources[0]?.url;
  const { data: feedData } = await axiosClient({ url });
  const { feed } = parse(feedData, { ignoreAttributes: false });
  const capWarnings: CapWarning[] = (
    await Promise.all(
      feed.entry.map((entry: { link: { '@_href': string } }) =>
        axiosClient({
          url: entry.link['@_href'],
        })
      )
    )
  ).map(({ data }) => parse(data).alert);
  return capWarnings;
};

export default getCapWarnings;

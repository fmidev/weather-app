import { Config } from '@config';
import { CapWarning } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import { parse } from 'fast-xml-parser';
import moment from 'moment';

const getCapWarnings = async () => {
  const { capViewSettings } = Config.get('warnings');

  const url = capViewSettings?.datasources[0]?.url;
  const { data: feedData } = await axiosClient({ url });
  const { feed } = parse(feedData, { ignoreAttributes: false });
  const entriesList = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
  const capWarnings: CapWarning[] = (
    await Promise.all(
      entriesList.map((entry: { link: { '@_href': string } }) =>
        axiosClient({
          url: entry.link['@_href'],
        })
      )
    )
  ).map(({ data }) => parse(data).alert);

  const activeWarnings = capWarnings.filter(
    (warning) => !moment(warning.info.expires).isBefore(moment.now())
  );
  return activeWarnings;
};

export default getCapWarnings;

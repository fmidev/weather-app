import { Config } from '@config';
import { CapWarning } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import { parse } from 'fast-xml-parser';
import moment from 'moment';

const isRelevantMessage = (warning: CapWarning) => {
  const isActual = warning.status === 'Actual';
  const isPublic = warning.scope === 'Public';
  const isMet = warning.info.category === 'Met';
  const isAckOrError = ['Ack', 'Error'].includes(warning.msgType);
  const hasValidUrgency = ['Immediate', 'Expected', 'Future'].includes(
    warning.info.urgency
  );
  const hasArea =
    Boolean(warning.info.area?.polygon) || Boolean(warning.info.area?.circle);
  const hasExpired = moment(warning.info.expires).isBefore(moment.now());

  return (
    isActual &&
    isPublic &&
    isMet &&
    !isAckOrError &&
    hasValidUrgency &&
    hasArea &&
    !hasExpired
  );
};

const parseReferences = (references: string) =>
  references.split(' ').map((ref) => ref.split(',')[1]);

const getCapWarnings = async () => {
  const { capViewSettings } = Config.get('warnings');

  const url = capViewSettings?.datasources[0]?.url;
  console.log('==== CapWarningsApi.getCapWarnings ====');
  console.log(url);
  console.log('==== ================ ====');
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
  )
    .map(({ data }) => parse(data).alert)
    .filter((warning) => warning); // remove undefined, null

  const relevantMessages = capWarnings.filter(isRelevantMessage);
  const updatedMessages = relevantMessages
    .filter((message) => message.msgType === 'Update')
    .map((message) => parseReferences(message.references))
    .flat();

  const canceledMessages = relevantMessages
    .filter((message) => message.msgType === 'Cancel')
    .map((message) => parseReferences(message.references))
    .flat();

  relevantMessages.filter(
    (message) =>
      ![...updatedMessages, ...canceledMessages].includes(message.identifier)
  );

  const finalMessages = relevantMessages.filter(
    (message) =>
      ![...updatedMessages, ...canceledMessages].includes(message.identifier)
  );

  return { updated: feed.updated, warnings: finalMessages };
};

export default getCapWarnings;

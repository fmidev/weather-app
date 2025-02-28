import { Config } from '@config';
import { CapWarning } from '@store/warnings/types';
import axiosClient from '@utils/axiosClient';
import { XMLParser } from 'fast-xml-parser';
import moment from 'moment';

const isRelevantMessage = (warning: CapWarning) => {
  const isActual = warning.status === 'Actual';
  const isPublic = warning.scope === 'Public';
  const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
  const isMet = info.category === 'Met';
  const isAckOrError = ['Ack', 'Error'].includes(warning.msgType);
  const hasValidUrgency = ['Immediate', 'Expected', 'Future'].includes(info.urgency);
  const hasArea = Boolean(info.area?.polygon) || Boolean(info.area?.circle);

  const hasExpired = moment(info.expires).isBefore(moment.now());

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
  const CAP_MIME_TYPE = 'application/cap+xml';
  const options = {
    ignoreAttributes: false,
    processEntities: true,
  };
  const parser = new XMLParser(options);

  const { capViewSettings } = Config.get('warnings');

  const url = capViewSettings?.datasources[0]?.url;
  const { data: feedData } = await axiosClient({ url });
  const { feed } = parser.parse(feedData);
  const entriesList = Array.isArray(feed.entry) ? feed.entry : [feed.entry];

  const urls : [string] = entriesList.map((entry: { link: [{ '@_href': string, '@_type': string | undefined }] }) => {
    if (Array.isArray(entry.link)) {
      // Meteoalarm feed may contain multiple links
      const links = entry.link.filter((link) => link['@_type'] && link['@_type'] === CAP_MIME_TYPE);
      return links[0]['@_href'];
    } else {
      // Smartmet feed contains only one link
      return entry.link['@_href'];
    }
  });
  const uniqueUrls = [...new Set(urls)];

  const capWarnings: CapWarning[] = (
    await Promise.all(
      uniqueUrls.map(capUrl => axiosClient({ url: capUrl }))
    )
  ).map(({ data }) => parser.parse(data).alert)
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

import addFormats from 'ajv-formats';

const uriReference = addFormats.get('uri-reference') as RegExp;

// RFC 3987 section 2.2: ucschar and iprivate character ranges.
const isUcsChar = (code: number) =>
  (code >= 0xa0 && code <= 0xd7ff) ||
  (code >= 0xf900 && code <= 0xfdcf) ||
  (code >= 0xfdf0 && code <= 0xffef) ||
  (code >= 0x10000 && code <= 0xdfffd && code % 0x10000 <= 0xfffd) ||
  (code >= 0xe1000 && code <= 0xefffd);

const isPrivateChar = (code: number) =>
  (code >= 0xe000 && code <= 0xf8ff) ||
  (code >= 0xf0000 && code <= 0x10fffd && code % 0x10000 <= 0xfffd);

export const isIRIReference = (value: string): boolean => {
  const queryStart = value.indexOf('?');
  const fragmentStart = value.indexOf('#');
  let offset = 0;

  // Map permitted Unicode characters to URI escapes; leave invalid characters
  // untouched so URI validation rejects them. Private characters are query-only.
  const uri = Array.from(value, (character) => {
    const code = character.codePointAt(0)!;
    const inQuery = queryStart !== -1 && offset > queryStart &&
      (fragmentStart === -1 || offset < fragmentStart);
    offset += character.length;
    return isUcsChar(code) || (inQuery && isPrivateChar(code))
      ? encodeURIComponent(character)
      : character;
  }).join('');

  return uriReference.test(uri);
};

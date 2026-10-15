import { isIRIReference } from '../../src/utils/iriReference';

describe('isIRIReference', () => {
  it.each([
    '',
    'image.jpg',
    '../sää/kuva.jpg',
    '//kuvat.例え/sää🌦️.jpg',
    'https://例え.example/天気?paikka=Jyväskylä#sää',
    '//images.example/encoded%20image.jpg',
    'custom-scheme:sää',
    '//images.example/image.jpg?private=\ue000',
    '//images.example/image.jpg?private=\u{f0000}',
    '//images.example/image.jpg?private=\u{100000}',
  ])('accepts valid IRI reference %j', (value) => {
    expect(isIRIReference(value)).toBe(true);
  });

  it.each([
    '//images.example/invalid image.jpg',
    '//images.example/%ZZ.jpg',
    '//images.example/%2.jpg',
    '//images.example/[invalid.jpg',
    '//images.example/\nimage.jpg',
    '//images.example/\u0080.jpg',
    '//images.example/\ud800.jpg',
    '//images.example/\ufffe.jpg',
    '//images.example/\u{1ffff}.jpg',
    '//images.example/\u{e0001}.jpg',
    '//images.example/\ue000.jpg',
    '//images.example/\u{f0000}.jpg',
    '//images.example/image.jpg#\ue000',
    '//images.example/image.jpg#fragment?private=\ue000',
  ])('rejects invalid IRI reference %j', (value) => {
    expect(isIRIReference(value)).toBe(false);
  });
});

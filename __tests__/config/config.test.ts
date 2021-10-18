// @ts-ignore
import DynamicConfig from '@config/DynamicConfig';
import defaultConfig from './testConfig';

describe('Modify arrays', () => {
  it('Value list', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        settings: { languages: ['extra'] },
      })
    ).toMatchObject({
      settings: { languages: ['fi', 'sv', 'en', 'extra'] },
    });
  });

  it('Object list append', () => {
    const result = DynamicConfig.mergeObject(
      JSON.parse(JSON.stringify(defaultConfig)),
      {
        map: {
          layers: [{ ...defaultConfig.map.layers[0], ...{ id: 9 } }],
        },
      }
    );
    expect(result.map.layers[2]).toMatchObject({
      ...defaultConfig.map.layers[0],
      ...{ id: 9 },
    });
    expect(result.map.layers.length).toBe(3);
  });

  it('Object list edit', () => {
    const result = DynamicConfig.mergeObject(
      JSON.parse(JSON.stringify(defaultConfig)),
      {
        map: {
          layers: [
            {
              id: 7,
              legend: 'newUrl',
              sources: [
                {
                  source: 'server3',
                  layer: 'layerName1',
                },
              ],
            },
          ],
        },
      }
    );
    expect(result.map.layers[1]).toMatchObject({
      ...defaultConfig.map.layers[1],
      ...{
        legend: 'newUrl',
        sources: [
          {
            ...defaultConfig.map.layers[1].sources[0],
            ...{ source: 'server3' },
          },
          defaultConfig.map.layers[1].sources[1],
        ],
      },
    });
    expect(result.map.layers.length).toBe(2);
    expect(result).not.toMatchObject(defaultConfig);
  });
});

describe('Modify Objects', () => {
  it('Edit first level', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        dynamicConfig: { interval: 300 },
      })
    ).toMatchObject({
      dynamicConfig: { interval: 300 },
    });
  });

  it('Edit second level', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        weather: { observation: { enabled: false } },
      })
    ).toMatchObject({
      weather: { observation: { enabled: false } },
    });
  });

  it('Add new key', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        map: { sources: { server3: 'server3Url' } },
      })
    ).toMatchObject({
      map: {
        sources: { ...defaultConfig.map.sources, ...{ server3: 'server3Url' } },
      },
    });
  });
});

describe('Merge checks', () => {
  it('Set object to array', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        map: {
          layers: [
            { ...defaultConfig.map.layers[0], ...{ id: 1, sources: {} } },
          ],
        },
        settings: { languages: {} },
      })
    ).toEqual(defaultConfig);
  });

  it('Set array to object', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        map: [],
      })
    ).toEqual(defaultConfig);
  });

  it('Set empty object', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        dynamicConfig: {},
        map: {
          layers: [
            { ...defaultConfig.map.layers[0], ...{ id: 1, sources: [{}] } },
          ],
        },
      })
    ).toEqual(defaultConfig);
  });

  it('Set empty array', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        settings: { languages: [] },
      })
    ).toEqual(defaultConfig);
  });

  it('Set wrong value type', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        dynamicConfig: {
          enabled: 'true',
          apiUrl: 1,
          interval: '1',
        },
      })
    ).toEqual(defaultConfig);
  });
});

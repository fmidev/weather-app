import { getLayerDocumentation } from '../../src/network/MarkdownApi';

const mockAxiosClient = jest.fn();
const mockConfigGet = jest.fn();

jest.mock('@utils/axiosClient', () => ({
  __esModule: true,
  default: (...args: any[]) => mockAxiosClient(...args),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

describe('MarkdownApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockConfigGet.mockReturnValue({
      infoBottomSheet: {
        url: 'https://docs.example/{lang}/{layer}.md',
      },
    });
  });

  it('fetches markdown documentation for converted layer names', async () => {
    mockAxiosClient.mockResolvedValueOnce({ data: '# Layer docs' });

    await expect(getLayerDocumentation('radar:finland', 'fi')).resolves.toBe(
      '# Layer docs'
    );
    expect(mockAxiosClient).toHaveBeenCalledWith(
      { url: 'https://docs.example/fi/radar-finland.md' },
      undefined,
      'Map'
    );
  });

  it('rejects missing documentation url', async () => {
    mockConfigGet.mockReturnValue({ infoBottomSheet: {} });

    await expect(getLayerDocumentation('radar', 'fi')).rejects.toThrow(
      'Documentation URL is not defined'
    );
  });
});

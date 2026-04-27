const mockConfigGet = jest.fn();
const mockCreateTracker = jest.fn();
const mockTrackEvent = jest.fn();
const mockTrackDispatch = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
  },
}));

jest.mock('@logicwind/react-native-matomo-tracker', () => ({
  createTracker: (...args: any[]) => mockCreateTracker(...args),
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
  trackDispatch: (...args: any[]) => mockTrackDispatch(...args),
}));

const importMatomo = async () => {
  jest.resetModules();
  return require('../../src/utils/matomo') as typeof import('../../src/utils/matomo');
};

describe('matomo utils', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockCreateTracker.mockReset();
    mockTrackEvent.mockReset();
    mockTrackDispatch.mockReset();
    mockConfigGet.mockReturnValue({
      enabled: true,
      url: 'https://matomo.example',
      siteId: { en: 123 },
    });
  });

  it('initializes tracker from analytics config and current language', async () => {
    const { initMatomo } = await importMatomo();

    initMatomo();

    expect(mockConfigGet).toHaveBeenCalledWith('analytics');
    expect(mockCreateTracker).toHaveBeenCalledWith(
      'https://matomo.example',
      123
    );
  });

  it('does not initialize tracker when analytics are disabled', async () => {
    mockConfigGet.mockReturnValue({ enabled: false });
    const { initMatomo } = await importMatomo();

    initMatomo();

    expect(mockCreateTracker).not.toHaveBeenCalled();
  });

  it('initializes lazily before tracking an event', async () => {
    const { trackMatomoEvent } = await importMatomo();

    trackMatomoEvent('weather' as any, 'open' as any, 'front-page');

    expect(mockCreateTracker).toHaveBeenCalledWith(
      'https://matomo.example',
      123
    );
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'weather',
      'open',
      'front-page'
    );
  });

  it('does not track events when initialization is not enabled', async () => {
    mockConfigGet.mockReturnValue({ enabled: false });
    const { trackMatomoEvent } = await importMatomo();

    trackMatomoEvent('weather' as any, 'open' as any, 'front-page');

    expect(mockCreateTracker).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('dispatches events only after initialization', async () => {
    const { initMatomo, sendMatomoEvents } = await importMatomo();

    sendMatomoEvents();
    expect(mockTrackDispatch).not.toHaveBeenCalled();

    initMatomo();
    sendMatomoEvents();

    expect(mockTrackDispatch).toHaveBeenCalledTimes(1);
  });
});

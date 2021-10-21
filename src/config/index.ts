import ConfigProvider from './ConfigProvider';
import DynamicConfig from './DynamicConfig';

const Config = new DynamicConfig();

export { ConfigProvider, Config };
export * from './types';

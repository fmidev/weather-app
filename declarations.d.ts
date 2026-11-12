declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}

// Moment's locale modules register their translations without exporting values.
declare module 'moment/locale/fi';
declare module 'moment/locale/sv';
declare module 'moment/locale/en-gb';
declare module 'moment/locale/es';

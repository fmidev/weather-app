module.exports = {
  extends: [
    '@react-native-community',
    'airbnb-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['react', 'react-native'],
  env: {
    'react-native/react-native': true,
  },
  rules: {
    'global-require': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 2,
    'react-native/no-inline-styles': 2,
    'react-native/no-color-literals': 2,
    'no-trailing-spaces': ['error'],
    'no-multiple-empty-lines': ['error'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: true, classes: true, variables: false },
    ],
  },
  ignorePatterns: [
    '.eslintrc.js',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'e2e/*',
  ],
  root: true,
};

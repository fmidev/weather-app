module.exports = {
  extends: [
    '@react-native',
    'airbnb-typescript',
    'prettier',
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
  plugins: ['react', 'react-native', 'jest', 'import', 'react-hooks'],
  env: {
    'react-native/react-native': true,
  },
  rules: {
    'global-require': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
    'react/prop-types': 'off',
    'react/require-default-props': [2, { ignoreFunctionalComponents: true }],
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
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/default-param-last': 1,
  },
  ignorePatterns: [
    '.eslintrc.js',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'e2e/*',
    'node_modules/',
  ],
  root: true,
};

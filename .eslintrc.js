module.exports = {
  extends: [
    '@react-native-community',
    'airbnb-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  parser: 'babel-eslint',
  plugins: ['react', 'react-native'],
  env: {
    'react-native/react-native': true,
  },
  rules: {
    'global-require': 0,
    'no-use-before-define': [
      'error',
      { functions: true, classes: true, variables: false },
    ],
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 2,
    'react-native/no-inline-styles': 2,
    'react-native/no-color-literals': 2,
    'no-trailing-spaces': ['error'],
    'no-multiple-empty-lines': ['error'],
  },
  root: true,
};

const reactNative = require('@react-native/eslint-config/flat');
const { configs, plugins } = require('eslint-config-airbnb-extended');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      '**/.*',
      '**/node_modules/**',
      'android/**/build/**',
      'android/.gradle/**',
      'ios/Pods/**',
      'ios/build/**',
      'coverage/**',
      '**/*.test.js',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'eslint.config.js',
      'e2e/**',
    ],
  },
  // Keep React Native's JavaScript parser while omitting Flow-only lint support.
  ...reactNative.map(config => config.plugins?.['ft-flow'] ? {
    ...config,
    plugins: Object.fromEntries(
      Object.entries(config.plugins).filter(([name]) => name !== 'ft-flow')
    ),
    rules: Object.fromEntries(
      Object.entries(config.rules).filter(([name]) => !name.startsWith('ft-flow/'))
    ),
  } : config),
  plugins.stylistic,
  plugins.importX,
  // Match the previous airbnb-typescript layer without enabling Airbnb's full
  // JavaScript and React presets as part of the configuration migration.
  ...configs.base.typescript,
  ...configs.react.typescript,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    // Keep the previous TypeScript conventions during the preset migration.
    // These Airbnb Extended rules were not enabled by airbnb-typescript.
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-find': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: true, classes: true, variables: false },
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/default-param-last': 'warn',
    },
  },
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx}'],
    rules: {
      'global-require': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }],
      'react/prop-types': 'off',
      'react/require-default-props': ['error', { ignoreFunctionalComponents: true }],
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['mockserver/**'] },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    rules: {
      'no-use-before-define': [
        'error',
        { functions: true, classes: true, variables: false },
      ],
      'no-unused-vars': 'error',
      'default-param-last': 'warn',
    },
  },
];

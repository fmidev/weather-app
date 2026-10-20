const reactNative = require('@react-native/eslint-config/flat');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const flowPlugin = require('eslint-plugin-ft-flow');
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
  // React Native still bundles the Flow plugin's ESLint 8 release. Use the
  // project's ESLint 9 compatible version while keeping its existing rules.
  ...reactNative.map(config => config.plugins?.['ft-flow'] ? {
    ...config,
    plugins: { ...config.plugins, 'ft-flow': flowPlugin },
  } : config),
  plugins.stylistic,
  plugins.importX,
  {
    plugins: { '@typescript-eslint': typescriptPlugin },
  },
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
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: true, classes: true, variables: false },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/default-param-last': 'warn',
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['mockserver/**'] },
      ],
    },
  },
];

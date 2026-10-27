const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', '.expo/**', 'test-results/**', 'playwright-report/**'] },
  { files: ['**/*.ts', '**/*.tsx'], rules: { camelcase: ['error', { properties: 'never', ignoreDestructuring: true }], '@typescript-eslint/no-explicit-any': 'error' } },
]);

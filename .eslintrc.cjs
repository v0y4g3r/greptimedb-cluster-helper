/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
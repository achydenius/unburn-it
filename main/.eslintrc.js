module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier', 'plugin:import/typescript'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'no-new': 0,
    'import/extensions': 0,
    '@typescript-eslint/explicit-function-return-type': 1,
    'no-param-reassign': 1,
    '@typescript-eslint/no-non-null-assertion': 1,
    'no-unused-vars': 0,
    'no-plusplus': 0,
  },
}

export default [{
  files: ['src/**/*.js', 'test/**/*.js'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'off',
  },
}];

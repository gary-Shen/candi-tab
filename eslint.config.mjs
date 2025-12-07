import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  ignores: ['dist', 'node_modules', '*.min.js'],
}, {
  files: ['server/**/*.js'],
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'ts/no-var-requires': 'off',
    'unused-imports/no-unused-vars': 'off',
  },
}, {
  files: ['vite.config.ts'],
  rules: {
    'node/prefer-global/process': 'off',
  },
})

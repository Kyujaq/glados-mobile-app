module.exports = {
  root: true,
  extends: ['@react-native/eslint-config'],
  ignorePatterns: ['node_modules/', 'android/', 'ios/'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};

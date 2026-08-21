const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  // setupFilesAfterEnv is used after the jest environment has been loaded.  In general this is what you want.  
  // If you want to add config BEFORE jest loads, use setupFiles instead.  
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.tsx',
  ],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  // e2e/ holds Playwright specs, which have their own runner and their own
  // globals — Jest picking them up fails at import time.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  coveragePathIgnorePatterns: [
    'src/setupTest.tsx',
    'src/i18n',
  ],
});

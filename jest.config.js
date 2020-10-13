module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  resetModules: true,
  restoreMocks: true,
  roots: [
    '<rootDir>/src/',
    '<rootDir>/tests/'
  ],
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'src/**',
    '!src/@types/**',
    '!**/*.spec.ts'
  ],
  coverageDirectory: 'test-results',
  reporters: ['default'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1'
  }
}

module.exports = {
  preset: 'ts-jest',
  collectCoverage: false,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleDirectories: ['node_modules', '../node_modules']
};
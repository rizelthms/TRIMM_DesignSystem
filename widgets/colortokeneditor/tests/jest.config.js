module.exports = {
    rootDir: '.',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/*.test.(ts|tsx)'],
    moduleNameMapper: {
        '\\.(css|scss)$': 'identity-obj-proxy',
    },
}; 
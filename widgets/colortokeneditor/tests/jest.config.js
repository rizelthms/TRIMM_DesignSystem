module.exports = {
    rootDir: '.',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    transformIgnorePatterns: [
        '/node_modules/'
    ],
    moduleNameMapper: {
        '\\.(css|scss)$': 'identity-obj-proxy',
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom'
    },
    collectCoverage: false,
    collectCoverageFrom: [
        '../src/**/*.{ts,tsx}',
        '!../src/**/*.d.ts',
        '!../src/**/index.ts',
        '!../src/**/index.tsx',
    ]
}; 
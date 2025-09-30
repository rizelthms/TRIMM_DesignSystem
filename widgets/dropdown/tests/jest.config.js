/**
 * TRIMM Design System - Dropdown Jest Configuration
 * 
 * Jest configuration for testing the TRIMM Dropdown widget.
 * Provides TypeScript support, DOM environment, and proper module resolution
 * for comprehensive testing of the dropdown menu functionality.
 */

module.exports = {
    rootDir: '.',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
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
        '^react$': '<rootDir>/../node_modules/react',
        '^react/jsx-runtime$': '<rootDir>/../node_modules/react/jsx-runtime',
        '^react-dom$': '<rootDir>/../node_modules/react-dom',
        '^react-dom/test-utils$': '<rootDir>/react-dom-test-utils-shim.js'
    },
    collectCoverage: false,
    collectCoverageFrom: [
        '../src/**/*.{ts,tsx}',
        '!../src/**/*.d.ts',
        '!../src/**/index.ts',
        '!../src/**/index.tsx',
    ],
    moduleDirectories: [
        "node_modules",
        "../../../node_modules"
    ]
}; 
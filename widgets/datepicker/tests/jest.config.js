/**
 * TRIMM Design System - Datepicker Jest Configuration
 * 
 * Jest configuration for testing the TRIMM Datepicker widget.
 * Provides TypeScript support, DOM environment, and proper module resolution
 * for comprehensive testing of the date selection functionality.
 */

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
        '\\.(css|scss)$': 'identity-obj-proxy'
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
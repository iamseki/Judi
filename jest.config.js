module.exports = {
    roots: ['<rootDir>/tests'],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/main/**'
    ],
    coveragePathIgnorePatterns: [
        "<rootDir>/test/fixtures",
        "<rootDir>/src/proxies",
    ],
    coverageDirectory: 'coverage',
    coverageProvider: 'babel',
    testEnvironment: 'node',
    transform: {
        '.+\\.ts$': 'ts-jest'
    },
    moduleNameMapper: {
        '@/tests/(.*)': '<rootDir>/tests/$1',
        '@/(.*)': '<rootDir>/src/$1'
    }
}
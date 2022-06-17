module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/*.test.ts'],
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '<rootDir>/src/game/error.ts',
        '<rootDir>/src/game/viewer.ts',
        '<rootDir>/src/recorder/recorder.ts',
        '<rootDir>/src/server/*',
        '<rootDir>/src/logger.ts',
    ],
};

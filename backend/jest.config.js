module.exports = {
    testEnvironment: 'node',

    roots: ['<rootDir>/tests'],

    testMatch: ['**/*.test.js'],

    clearMocks: true,

    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/scripts/**',
    ],

    coverageDirectory: 'coverage',

    coverageReporters: ['text', 'html'],

    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
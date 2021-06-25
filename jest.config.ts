module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    modulePaths: ["<rootDir>/tests/"],
    testPathIgnorePatterns: ["dist"],
    setupFilesAfterEnv: ["<rootDir>/jestFilesAfterEnv.ts"],
};

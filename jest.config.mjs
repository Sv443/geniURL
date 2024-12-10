/** @type {import("jest").Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/out/"],
  testPathIgnorePatterns: ["node_modules/", "out/"],
  testMatch: ["**/test/**/*.spec.ts"],
};

export default config;

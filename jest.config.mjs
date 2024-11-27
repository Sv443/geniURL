/** @type {import("jest").Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules/", "out/"],
  testMatch: ["**/test/**/*.spec.ts"],
};

export default config;

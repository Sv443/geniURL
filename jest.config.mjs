/** @type {import("jest").Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/out/"],
  testPathIgnorePatterns: ["node_modules/", "out/"],
  testMatch: ["**/test/**/*.spec.(mjs|mts|js|ts)"],
  transform: {
    "^.+\\.(c|m)?ts$": ["ts-jest", {
      tsconfig: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2018",
        allowJs: true,
        allowImportingTsExtensions: true,
        allowSyntheticDefaultImports: true,
        importHelpers: true,
      }
    }],
  }
};

export default config;

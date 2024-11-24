module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
  ],
  ignorePatterns: [
    "out/**",
    "test.*",
  ],
  rules: {
    "quotes": [ "error", "double" ],
    "semi": [ "error", "always" ],
    "eol-last": [ "error", "always" ],
    "no-async-promise-executor": "off",
    // see https://github.com/eslint/eslint/issues/14538#issuecomment-862280037
    "indent": ["error", 2, { "ignoredNodes": ["VariableDeclaration[declarations.length=0]"] }],
    "comma-dangle": ["error", "only-multiline"],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "ignoreRestSiblings": true, "argsIgnorePattern": "^_" }],
    "@typescript-eslint/ban-ts-comment": "off",
    "no-misleading-character-class": "off",
  },
  overrides: [
    {
      files: ["**.js", "**.cjs", "**.mjs"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "quotes": [ "error", "double" ],
        "semi": [ "error", "always" ],
        "eol-last": [ "error", "always" ],
        "no-async-promise-executor": "off",
        "indent": ["error", 2, { "ignoredNodes": ["VariableDeclaration[declarations.length=0]"] }],
        "comma-dangle": ["error", "only-multiline"],
      },
    },
  ],
};

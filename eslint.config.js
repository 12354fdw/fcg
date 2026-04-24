const robloxTs = require("eslint-plugin-roblox-ts");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "roblox-ts": robloxTs,
    },
    rules: {
      ...robloxTs.configs.recommended.rules,
    },
  },
];
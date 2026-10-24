const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  prettier,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.jest },
    },
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: { ...globals.browser },
    },
  },
  { ignores: ["node_modules/", "coverage/"] },
];

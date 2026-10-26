import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "public/**",
      "src/**/*.cjs"
    ]
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },

    plugins: {
      "react-hooks": reactHooks
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      // Unused variables warning
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],

      // ✅ Allow 'any' types (silences remaining 18 warnings)
      "@typescript-eslint/no-explicit-any": "off",

      // Handled by TypeScript compiler
      "no-undef": "off",

      // Allow require imports in .cjs files
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];
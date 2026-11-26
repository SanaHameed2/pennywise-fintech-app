import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: [
      "dist/**",
      "dev-dist/**",    // ✅ ADDED: PWA generated files ko ignore karne ke liye
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
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      // Accessibility is enforced in CI: new violations fail the build.
      ...jsxA11y.flatConfigs.recommended.rules,

      // Unused variables warning
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],

      // ✅ Allow 'any' types 
      "@typescript-eslint/no-explicit-any": "off",

      // Handled by TypeScript compiler
      "no-undef": "off",

      // Allow require imports in .cjs files
      "@typescript-eslint/no-require-imports": "off"
    }
  },

  // Playwright fixtures use a callback named `use`, which the React-hooks rule mistakes for a hook.
  {
    files: ["tests/e2e/**/*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "no-empty-pattern": "off"
    }
  }
];

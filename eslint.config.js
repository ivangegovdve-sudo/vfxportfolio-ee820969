import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const noRuntimeSrcAssetUrlRule = {
  selector: "Literal[value=/^\\/src\\//]",
  message:
    "Do not use runtime '/src/...' asset URLs. Use imported assets or '/assets/...' from public.",
};

const noThumbnailLiteralRule = {
  selector: "Property[key.name='thumbnail'] > Literal",
  message:
    "Portfolio thumbnail values in cvData.ts must come from imported thumbnail constants, not string literals.",
};

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-syntax": ["error", noRuntimeSrcAssetUrlRule],
    },
  },
  {
    files: ["src/data/cvData.ts"],
    rules: {
      "no-restricted-syntax": ["error", noRuntimeSrcAssetUrlRule, noThumbnailLiteralRule],
    },
  }
);

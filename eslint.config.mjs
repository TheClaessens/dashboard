import { defineConfig, globalIgnores } from "eslint/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import tailwind from "eslint-plugin-tailwindcss";

const __dirname = dirname(fileURLToPath(import.meta.url));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ...tailwind.configs.recommended,
    settings: {
      tailwindcss: {
        cssConfigPath: join(__dirname, "src/styles/globals.css"),
      },
    },
    rules: {
      ...tailwind.configs.recommended.rules,
      // Alpha v4 plugin has false positives for border+divide and CVA/group patterns
      "tailwindcss/no-contradicting-classname": "off",
      "tailwindcss/no-custom-classname": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

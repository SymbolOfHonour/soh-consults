import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This site intentionally uses ordinary anchors for full-page navigation.
      "@next/next/no-html-link-for-pages": "off",
      // Existing admin loaders update local state after asynchronous effects.
      "react-hooks/set-state-in-effect": "off",
      // Server-rendered pages calculate request-time operational metrics.
      "react-hooks/purity": "off",
      // Calculators build mutable export models before generating files.
      "react-hooks/immutability": "off",
      // Public and admin content can reference arbitrary Supabase/external image URLs.
      // Plain images preserve those uploads without maintaining a brittle host allowlist.
      "@next/next/no-img-element": "off",
      // The visual editor deliberately performs a full reload after authentication so
      // server-rendered admin state and cookies are refreshed together.
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
  {
    files: ["tests/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@next/next/no-assign-module-variable": "off",
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

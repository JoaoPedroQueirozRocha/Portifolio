import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Modo autocontido do Caderno de Violino: só pode depender do núcleo
  // (@/lib/armaduras, @/lib/violinSound, ../shared) e de si mesmo, para sair
  // do repositório sem reescrita. Ver docs/specs/ se existir o plano.
  {
    files: ["components/violino/roda/**/*.{ts,tsx}", "components/violino/eco/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: [
              "@/app/**", "@/components/ui/**", "@/components/layout/**",
              "@/lib/utils", "@/lib/experience", "@/lib/i18n",
              "@/components/violino/armaduras/**", "@/components/violino/onde-tocar/**",
              "../armaduras/**", "../onde-tocar/**",
            ],
            message: "Um modo só importa o núcleo do violino (lib/armaduras, lib/leitura, lib/violinSound, ../shared) e a si mesmo.",
          },
        ],
      }],
    },
  },
]);

export default eslintConfig;

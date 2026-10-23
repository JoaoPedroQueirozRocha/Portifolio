import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

// Só lógica pura (sem DOM): os testes ficam ao lado do código, em __tests__/
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["**/__tests__/**/*.test.ts"], exclude: ["node_modules/**", ".next/**"] },
})

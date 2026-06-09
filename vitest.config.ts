import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "src"),
      "@contracts": path.resolve(templateRoot, "contracts"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
      "@api": path.resolve(templateRoot, "api"),
      "@db": path.resolve(templateRoot, "db"),
      "@srclib": path.resolve(templateRoot, "src/lib"),
      "@components": path.resolve(templateRoot, "src/components"),
      "@pages": path.resolve(templateRoot, "src/pages"),
      "@tabs": path.resolve(templateRoot, "src/tabs"),
      "@types": path.resolve(templateRoot, "src/types"),
      "@apilib": path.resolve(templateRoot, "api/lib"),
      "@queries": path.resolve(templateRoot, "api/queries"),
      "@routers": path.resolve(templateRoot, "api/routers"),
    },
  },
  test: {
    environment: "node",
    include: ["api/**/*.test.ts", "api/**/*.spec.ts"],
  },
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/templs.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});

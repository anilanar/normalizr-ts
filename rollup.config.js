import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const ts = typescript({
    tsconfigOverride: {
        compilerOptions: {
            rootDir: "src2"
        },
        exclude: ["node_modules", "./src/**/*.test.ts"]
    }
});

export default [
    // browser-friendly UMD build
    {
        input: "src2/index.ts",
        output: {
            name: "normalizr-ts",
            file: pkg.browser,
            format: "umd"
        },
        plugins: [resolve(), commonjs(), ts, terser()]
    },

    {
        input: "src2/index.ts",
        external: [],
        plugins: [ts, terser()],
        output: [
            { file: pkg.main, format: "cjs" },
            { file: pkg.module, format: "es" }
        ]
    }
];

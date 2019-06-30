import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

const ts = typescript({
    tsconfigOverride: {
        exclude: ["node_modules", "./src/**/*.test.ts"]
    }
});

export default [
    // browser-friendly UMD build
    {
        input: "src/index.ts",
        output: {
            name: "normalizr-ts",
            file: pkg.browser,
            format: "umd"
        },
        plugins: [resolve(), commonjs(), ts]
    },

    {
        input: "src/index.ts",
        external: ["@ramda/mergewith"],
        plugins: [ts],
        output: [
            { file: pkg.main, format: "cjs" },
            { file: pkg.module, format: "es" }
        ]
    }
];

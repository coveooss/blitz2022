import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import css from "rollup-plugin-css-only";
import sveld from "sveld";

const production = !process.env.ROLLUP_WATCH;
const formats = ["iife", "umd", "es"];

export default {
    input: `src/lib/index.ts`,
    output: formats.map((format) => ({
        sourcemap: true,
        name: 'blitzui',
        file: `dist/index.${format}.min.js`,
        format,
    })),
    plugins: [
        typescript({ rollupCommonJSResolveHack: false, clean: true, }),
        svelte({ preprocess: sveltePreprocess(), compilerOptions: { dev: !production }}),
        css({ output: "blitzui.css" }),
        sveld({
            glob: true,
            types: true,
        }),
        resolve({
            extensions: [".svelte", ".ts", ".js", ".d.ts"],
            dedupe: ["svelte"]
        }),
        commonjs(),
        production && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
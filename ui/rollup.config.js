import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import preprocess from 'svelte-preprocess';
import { eslint } from "rollup-plugin-eslint";
import sass from 'node-sass';
import fs from 'fs';

//import sizes from 'rollup-plugin-sizes';

const production = process.env.DEV!=="true";
console.log("Performing a " + (production ? "production" : "dev") + " build");

const watch = process.env.ROLLUP_WATCH;

sass.render({
  file: 'src/global.scss',
  outfile: 'public/global-compiled.css'
}, function (error, result) {
  if (!error) {
    fs.writeFile('public/global-compiled.css', result.css, function (err) {
      if (err) {
        console.log(err)
      }
    });
  } else {
    console.log(error)
  }
});

export default {

  input: 'src/main.ts',

  output: {
    sourcemap: !production,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },

  plugins: [

    eslint({"ignorePattern": ["src/components/**/*", "src/App.svelte"]}),

    typescript(),

    svelte({
      preprocess: preprocess({
        typescript: {
          transpileOnly: false, // true skips type checking
        },
      }),
      // enable run-time checks when not in production
      dev: !production,
      // extract component CSS out into a separate file — better for performance
      css: css => {
        // second arg controls whether we generate a sourcemap
        css.write('public/bundle.css', !production);
      }
    }),

    resolve(),
    commonjs(),

    babel({
      extensions: ['.js', '.svelte', '.ts', '.mjs'],
      presets: [
        [
          "@babel/env",
          {
            targets: {
              ie: '11',
            },
            useBuiltIns: false // cannot use babel polyfill due to IE11.  see documentation in index.html for details.
          },
        ]
      ]
    }),

    // Watch the `public` directory and refresh the browser on changes when not in production
    watch && livereload('public'),

    // If we're building for production (npm run build instead of npm run dev), minify
    production && terser({ sourcemap: false }),

    // uncomment to display bundle component sizes
    //sizes({ details: true})

  ]

};

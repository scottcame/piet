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

import postcss from 'postcss';
import purgecss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

//import sizes from 'rollup-plugin-sizes';

const production = process.env.DEV!=="true";
console.log("Performing a " + (production ? "production" : "dev") + " build");

const watch = process.env.ROLLUP_WATCH;

// render scss stylesheet. in reality, we should be putting any global styles in the base (root) tailwind.css and rebuilding
// tailwind-gen.css, and so this shouldn't be needed. but we can leave it here for now.

sass.render({
  file: 'src/global.scss',
  outFile: 'public/global-compiled.css',
  sourceMap: !production && 'global-compiled.css.map'
}, function (error, result) {
  if (!error) {
    fs.writeFileSync('public/global-compiled.css', result.css);
    if (result.map) {
      fs.writeFileSync('public/global-compiled.css.map', result.map, () => true)
    }
  } else {
    console.log(error)
  }
});

let postcssPlugins = [autoprefixer];

if (true) {
  // to skip purgecss in dev, change if() to check for production
  // experiment found that purge only takes about .4 seconds...
  postcssPlugins.push(purgecss({
    content: [
      './src/**/*.svelte'
    ],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
  }));
}

// minify the css if we're in production
if (production) postcssPlugins.push(cssnano);

const postcssProcessor = postcss(postcssPlugins);

// post css processing of tailwind stylesheet (no sourcemap if in production)

fs.readFile('public/tailwind-gen.css', (err, css) => {
  postcssProcessor.process(css, { from: 'public/tailwind-gen.css', to: 'public/tailwind.css', map: !production && { inline: false } })
    .then(result => {
      fs.writeFileSync('public/tailwind.css', result.css, () => true);
      if (result.map) {
        fs.writeFileSync('public/tailwind.css.map', result.map, () => true)
      }
    });
});

// todo: if we find we have a lot of unused css in global-compiled.css, we can purgecss it too.

// now we move on to export the default object (rollup setup)

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

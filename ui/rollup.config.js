// Copyright 2020 National Police Foundation
// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import { eslint } from "rollup-plugin-eslint";
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import sass from 'node-sass';
import fs from 'fs';

import postcss from 'postcss';
import purgecss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

//import sizes from 'rollup-plugin-sizes';

const production = process.env.DEV !== "true";
const remote = process.env.REMOTE === "true";

console.log("Performing a " + (production ? "production" : "dev") + " build");
if (!production) console.log("Note: dev builds do not include babel transpilation");

let playground = false;
if (process.env.PLAYGROUND === "true") {
  console.log("Running the playground app, not main.ts");
  playground = true;
}

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

if (production) {
  // to skip purgecss in dev, change if() to check for production
  // experiment found that purge only takes about .4 seconds...
  postcssPlugins.push(purgecss({
    content: [
      './src/**/*.svelte', './public/index.html'
    ],
    defaultExtractor: content => content.match(/[A-Za-z0-9:_/\-]+/g) || []
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

  onwarn(warning, warn) {
    if (
      // ignore these warnings introduced by Vega
      warning.code === 'CIRCULAR_DEPENDENCY' && /node_modules\/(?:vega-.+|d3-.+)/.test(warning.importer) ||
      warning.code === 'THIS_IS_UNDEFINED' && /node_modules\/(?:vega-.+|fast-json-.+)/.test(warning.loc.file)
    ) {
      return;
    }
    warn(warning);
  },

  input: playground ? 'src/playground-main.ts' : (remote ? 'src/main-remote.ts' : 'src/main-local.ts'),

  output: {
    sourcemap: !production,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },

  plugins: [

    eslint(),
    json(),

    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // extract component CSS out into a separate file — better for performance
      css: css => {
        // second arg controls whether we generate a sourcemap
        css.write('public/bundle.css', !production);
      }
    }),

    builtins(),
    resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
    commonjs(),
    typescript(),

    // don't transpile in dev mode, as Chrome (our dev browser) handles es6 javascript just fine, and transpiling doubles the rollup bundling time
    production && babel({
      extensions: ['.js', '.svelte', '.ts', '.mjs'],
      include: [
        'src/**', 'node_modules/svelte/**',
        // the following are required for vega / vega-lite, as they utilize es6 features that are not available in IE11 (ugh!)
				'node_modules/fast-json-patch/**', 'node_modules/d3-array/**', 'node_modules/d3-scale/**', 'node_modules/d3-force/**', 'node_modules/d3-delaunay/**', 'node_modules/delaunator/**',
        'node_modules/vega*/**',
        // end vega dependencies
      ],
      runtimeHelpers: true,
      presets: [
        [
          "@babel/env",
          {
            targets: {
              ie: '11',
            },
            corejs: 3,
            useBuiltIns: "entry"
          },
        ]
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: false
          }
        ]
      ]
    }),

    // Watch the `public` directory and refresh the browser on changes when not in production
    watch && livereload('public'),

    // If we're building for production (npm run build instead of npm run dev), minify
    production && terser({ sourcemap: false }),

    // uncomment to display bundle component sizes
    //sizes({ details: true})

  ],
  watch: {
		clearScreen: false
	}

};

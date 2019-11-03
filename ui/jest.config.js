module.exports = {
  "verbose": true,
  "transform": {
    "^.+\\.js$": [ require.resolve('babel-jest'), { configFile: './test/babel.config.js' } ]
  },
  "globals": {
    "NODE_ENV": "test"
  },
  "moduleFileExtensions": [
    "js"
  ],
  "moduleDirectories": [
    "node_modules"
  ]
}

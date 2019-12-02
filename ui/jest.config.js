module.exports = {
  "verbose": true,
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "globals": {
    "NODE_ENV": "test",
    'ts-jest': {
      diagnostics: { ignoreCodes: [6059,18002,18003,151001] }
    }
  },
  "moduleFileExtensions": [
    "js", "ts"
  ],
  "moduleDirectories": [
    "node_modules"
  ],
  "setupFiles": [
    "fake-indexeddb/auto"
  ]
}

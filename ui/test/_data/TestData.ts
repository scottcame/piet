import { deserialize } from 'bson';
import { readFileSync } from 'fs';

import * as testMetadata from './test-metadata.json';

export class TestData {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static TEST_METADATA: any = testMetadata;
  static _FOODMART_METADATA: any;
  static get FOODMART_METADATA(): any {
      if (!TestData._FOODMART_METADATA) {
          TestData._FOODMART_METADATA = deserialize(readFileSync('test/_data/foodmart-metadata.bson'));
      }
      return TestData._FOODMART_METADATA;
  }
}
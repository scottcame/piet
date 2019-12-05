import { deserialize } from 'bson';
import { readFileSync } from 'fs';

import * as testMetadata from './test-metadata.json';
import * as testResult2m1r1c from './mondrian-results-2m1r1c.json';

export class TestData {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static TEST_METADATA: any = testMetadata;
  static TEST_RESULT_2M1R1C: any = testResult2m1r1c;
  static _FOODMART_METADATA: any;
  static get FOODMART_METADATA(): any {
      if (!TestData._FOODMART_METADATA) {
          TestData._FOODMART_METADATA = deserialize(readFileSync('test/_data/foodmart-metadata.bson'));
      }
      return TestData._FOODMART_METADATA;
  }
}
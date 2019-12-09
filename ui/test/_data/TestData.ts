import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';

import * as testMetadata from './test-metadata.json';
import * as testResult2m1r1c from './mondrian-results-2m1r1c.json';
import * as testResult2m1r2c from './mondrian-results-2m1r2c.json';
import * as testResult2m2r1c from './mondrian-results-2m2r1c.json';
import * as testResult2m2r2c from './mondrian-results-2m2r2c.json';
import * as testResult1m0r0c from './mondrian-results-1m0r0c.json';

export class TestData {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static TEST_METADATA: any = testMetadata;
  static TEST_RESULT_2M1R1C: any = testResult2m1r1c;
  static TEST_RESULT_2M1R2C: any = testResult2m1r2c;
  static TEST_RESULT_2M2R1C: any = testResult2m2r1c;
  static TEST_RESULT_2M2R2C: any = testResult2m2r2c;
  static TEST_RESULT_1M0R0C: any = testResult1m0r0c;
}

export class FoodmartMetadata {
  private static INSTANCE: FoodmartMetadata = null;
  private _metadata: any;
  static getInstance(): FoodmartMetadata {
    if (FoodmartMetadata.INSTANCE === null) {
      FoodmartMetadata.INSTANCE = new FoodmartMetadata();
    }
    return FoodmartMetadata.INSTANCE;
  }
  async getMetadata(): Promise<any> {
    return new Promise((resolve, _reject): any => {
      if (!this._metadata) {
        let s = "";
        // note: file path relative to project root
        const stream = createReadStream('test/_data/foodmart-metadata.json.gz').pipe(createGunzip());
        stream.on('data', (data) => {
          data = data.toString();
          s = s + data;
        });
        stream.on('finish', () => {
          this._metadata = JSON.parse(s.toString());
          resolve(this._metadata);
        });
      } else {
        resolve(this._metadata);
      }
    });
  }
}
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';

import * as testMetadata from './test-metadata.json';
import * as testResult2m1r1c from './mondrian-results-2m1r1c.json';
import * as testResult2m1r2c from './mondrian-results-2m1r2c.json';
import * as testResult2m2r1c from './mondrian-results-2m2r1c.json';
import * as testResult2m2r2c from './mondrian-results-2m2r2c.json';
import * as testResult1m0r0c from './mondrian-results-1m0r0c.json';
import * as testResult1m0r1c from './mondrian-results-1m0r1c.json';
import * as testResult1m2hr0c from './mondrian-results-1m2hr0c.json';
import * as testResult1m2hr1c from './mondrian-results-1m2hr1c.json';
import * as testResult1m2x2hr1c from './mondrian-results-1m2x2hr0c.json';
import * as testResult1m2h2r0c from './mondrian-results-1m2h2r0c.json';

export class TestData {

  /* eslint-disable @typescript-eslint/no-explicit-any */
  static TEST_METADATA: any = testMetadata;

  // SELECT NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members}, {[Measures].[Store Sqft], [Measures].[Grocery Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]
  static TEST_RESULT_2M1R1C: any = testResult2m1r1c;

  // SELECT NON EMPTY CrossJoin(NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members}), {[Measures].[Store Sqft],[Measures].[Grocery Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]
  static TEST_RESULT_2M1R2C: any = testResult2m1r2c;

  // SELECT NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members}, {[Measures].[Store Sqft],[Measures].[Grocery Sqft]}) ON COLUMNS, NON EMPTY CrossJoin({[Store].[Stores].[Store Country].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members}) ON ROWS FROM [Store]
  static TEST_RESULT_2M2R1C: any = testResult2m2r1c;

  // SELECT NON EMPTY CrossJoin(NonEmptyCrossJoin({[Store].[Stores].[Store State].Members}, {[Time].[Time].[Year].Members}), {[Measures].[Units Shipped], [Measures].[Units Ordered]}) ON COLUMNS, NON EMPTY CrossJoin({[Product].[Products].[Product Family].Members}, {[Warehouse].[Warehouses].[City].Members}) ON ROWS FROM [Warehouse]
  static TEST_RESULT_2M2R2C: any = testResult2m2r2c;

  // SELECT NON EMPTY {[Measures].[Units Ordered]} ON COLUMNS FROM [Warehouse]
  static TEST_RESULT_1M0R0C: any = testResult1m0r0c;

  // SELECT NON EMPTY CrossJoin({[Store].[Stores].[Store State].Members},{[Measures].[Units Ordered]}) ON COLUMNS FROM [Warehouse]
  static TEST_RESULT_1M0R1C: any = testResult1m0r1c;

  // SELECT NON EMPTY Hierarchize({{[Store].[Stores].[Store Country].Members}, {[Store].[Stores].[Store City].Members}}) ON ROWS, {[Measures].[Store Sqft]} ON COLUMNS FROM [Store]
  static TEST_RESULT_1M2HR0C: any = testResult1m2hr0c;

  // SELECT NON EMPTY Hierarchize({{[Store].[Stores].[Store Country].Members}, {[Store].[Stores].[Store City].Members}}) ON ROWS, NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members}, {[Measures].[Store Sqft]}) ON COLUMNS FROM [Store]
  static TEST_RESULT_1M2HR1C: any = testResult1m2hr1c;

  // SELECT NON EMPTY CrossJoin(Hierarchize({{[Product].[Products].[Product Family].Members}, {[Product].[Products].[Product Department].Members}}), Hierarchize({{[Store].[Stores].[Store Country].Members}, {[Store].[Stores].[Store State].Members}})) ON ROWS, NON EMPTY {[Measures].[Units Ordered]} ON COLUMNS FROM [Warehouse]
  static TEST_RESULT_1M2X2HR1C: any = testResult1m2x2hr1c;

  // SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY NonEmptyCrossJoin(Hierarchize({{[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store Country].Members}}),NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members})) ON ROWS FROM [Store]
  static TEST_RESULT_1M2H2R0C: any = testResult1m2h2r0c;

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
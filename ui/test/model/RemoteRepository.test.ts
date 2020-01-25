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

import { Dataset } from "../../src/js/model/Dataset";
import { MondrianResult } from "../../src/js/model/MondrianResult";
import { RemoteRepository } from "../../src/js/model/Repository";

// const MONDRIAN_REST_URL = "http://localhost:58080/mondrian-rest/";
// const repository = new RemoteRepository(MONDRIAN_REST_URL, null);
const repository = new RemoteRepository(null);

// if we get a timeout on this test, it's because mondrian-rest takes a long time to initialize the foodmart database
jest.setTimeout(65000); // on my macbook, it tends to take just under 60 seconds for the foodmart database to initialize and a response to come back. ymmv.

test.skip('browse datasets', async () => {
  return repository.init().then(async () => {
    return repository.browseDatasets().then((datasets: Dataset[]) => {
      expect(datasets).toHaveLength(8);
      const testDatasets: Dataset[] = datasets.filter((d: Dataset): boolean => {
        return d.id === "http://localhost:58080/mondrian-rest//getMetadata?connectionName=test" && d.name === "Test";
      });
      expect(testDatasets).toHaveLength(1);
      const testDataset = testDatasets[0];
      expect(testDataset.label).toBe("Test [Test]");
      expect(testDataset.measures).toHaveLength(5);
    });
  });
});

test.skip('query', async() => {
  return repository.init().then(async () => {
    return repository.browseDatasets().then(async (datasets: Dataset[]) => {
      const testDatasets: Dataset[] = datasets.filter((d: Dataset): boolean => {
        return d.id === "http://localhost:58080/mondrian-rest//getMetadata?connectionName=test" && d.name === "Test";
      });
      expect(testDatasets).toHaveLength(1);
      return repository.executeQuery("SELECT NON EMPTY CrossJoin({[D1].[D1].[D1_DESCRIPTION].Members},{[Measures].[F1_M1]}) ON COLUMNS FROM [Test]", testDatasets[0]).then((result: MondrianResult) => {
        expect(result).not.toBeNull();
        expect(result.columnCaptions).toMatchObject([ 'D1_DESCRIPTION', 'MeasuresLevel' ]);
        expect(result.rowCaptions).toHaveLength(0);
        expect(result.cells).toHaveLength(2);
      });
    });
  });
});

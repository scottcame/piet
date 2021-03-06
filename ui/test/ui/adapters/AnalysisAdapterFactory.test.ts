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

import { LocalRepository } from "../../../src/js/model/Repository";
import { Analysis } from "../../../src/js/model/Analysis";
import { AnalysisAdapterFactory } from "../../../src/js/ui/adapters/AnalysisAdapterFactory";
import { List } from "../../../src/js/collections/List";
import { LoggerFactory } from "../../../src/js/util/LoggerFactory";

const adapterFactory = AnalysisAdapterFactory.getInstance();
const repo = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));

test('table row construction', async () => {
  return repo.init().then(async () => {
    return repo.browseAnalyses().then((repoAnalyses: Analysis[]): void => {
      const tableRows = adapterFactory.getAnalysesRowList(repoAnalyses);
      expect(repoAnalyses).toHaveLength(2);
      expect(tableRows).toHaveLength(2);
      expect(tableRows[0].getValueAt(0)).toBe(repoAnalyses[0].name);
      expect(tableRows[0].getValueAt(1)).toBe(repoAnalyses[0].description);
      expect(tableRows[1].getValueAt(0)).toBe(repoAnalyses[1].name);
      expect(tableRows[1].getValueAt(1)).toBe(repoAnalyses[1].description);
    });
  });
});

test('table row filtering', async () => {
  return repo.init().then(async () => {
    return repo.browseAnalyses().then(async (repoAnalyses: Analysis[]): Promise<void> => {
      const excludedRows = new List<Analysis>();
      return excludedRows.add(repoAnalyses[0]).then(() => {
        const tableRows = adapterFactory.getAnalysesRowList(repoAnalyses, excludedRows);
        expect(repoAnalyses).toHaveLength(2);
        expect(tableRows).toHaveLength(1);
        expect(tableRows[0].getValueAt(0)).toBe(repoAnalyses[1].name);
        expect(tableRows[0].getValueAt(1)).toBe(repoAnalyses[1].description);
        return Promise.resolve();
      });
    });
  });
});

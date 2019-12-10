import { RemoteRepository } from "../../src/js/model/Repository";
import { Dataset } from "../../src/js/model/Dataset";

const MONDRIAN_REST_URL = "http://localhost:58080/mondrian-rest/";

const repository = new RemoteRepository(MONDRIAN_REST_URL, null);

test.only('browse datasets', async () => {
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

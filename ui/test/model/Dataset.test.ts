/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dataset, Measure, Dimension } from '../../src/js/model/Dataset';
import { TestData, FoodmartMetadata } from '../_data/TestData';

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(TestData.TEST_METADATA, datasetId);

test('dataset', () => {
  expect(datasets).toHaveLength(6);
  for (const i of [...Array(6).keys()]) {
    expect(datasets[i].schemaName).toBe("Test");
    expect(datasets[i].id).toBe(datasetId);
    const expectedName = i <= 2 ? "Test" : "Test_Secure";
    expect(datasets[i].name).toBe(expectedName);
    expect(datasets[i].description).toBe(expectedName);
    expect(datasets[i].measureGroupName).toBe("F" + ((i%3)+1));
  }
});

test('measures', () => {
  expect(datasets[0].measures).toHaveLength(1);
  expect(datasets[0].measures[0].name).toBe("F1_M1");
  expect(datasets[0].measures[0].description).toBe("F1_M1");
  expect(datasets[0].measureGroupName).toBe("F1");
  expect(datasets[2].measures).toHaveLength(4);
  expect(datasets[2].measures.map((measure: Measure): string => { return measure.name; })).toMatchObject(["F3_M1","F3_M2","F3_MH","F3_M3"]);
});

test('dimensions', () => {
  expect(datasets[0].dimensions).toHaveLength(2);
  expect(datasets[0].dimensions[1].name).toBe("D1");
  expect(datasets[0].dimensions[1].description).toBe("D1");
  expect(datasets[2].dimensions).toHaveLength(3);
  expect(datasets[2].dimensions.map((dimension: Dimension): string => { return dimension.name; })).toMatchObject(["Measures", "D1","D2"]);
});

test('hierarchies and levels', () => {
  const mdDimension = TestData.TEST_METADATA.cubes[0].dimensions[1];
  const dimension = datasets[0].dimensions[1];
  mdDimension.hierarchies.forEach((mdHierarchy: any, hierarchyIdx: number): void => {
    expect(dimension.hierarchies[hierarchyIdx].name).toBe(mdHierarchy.name);
    expect(dimension.hierarchies[hierarchyIdx].description).toBe(mdHierarchy.caption);
    mdHierarchy.levels.forEach((_: any, levelIdx: number): void => {
      expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].name).toBe(mdHierarchy.levels[levelIdx].name);
      expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].description).toBe(mdHierarchy.levels[levelIdx].caption);
      expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].depth).toBe(mdHierarchy.levels[levelIdx].depth);
    });
  });
});

test('member levels', () => {
  const mdDimension = TestData.TEST_METADATA.cubes[0].dimensions[1];
  const dimension = datasets[0].dimensions[1];
  mdDimension.hierarchies.forEach((mdHierarchy: any, hierarchyIdx: number): void => {
    mdHierarchy.levels.forEach((mdLevel: any, levelIdx: number): void => {
      expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].members).toHaveLength(mdLevel.members.length);
      mdLevel.members.forEach((mdMember: any, memberIdx: number) => {
        expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].members[memberIdx].name).toBe(mdMember.name);
        expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].members[memberIdx].children).toHaveLength(mdMember.childMembers.length);
        mdMember.childMembers.forEach((mdChildMember: any, childMemberIdx: number) => {
          // we just test one layer down
          expect(dimension.hierarchies[hierarchyIdx].levels[levelIdx].members[memberIdx].children[childMemberIdx].name).toBe(mdChildMember.name);
        });
      });
    });
  });
});

test('level mdx string', () => {
  expect(datasets[0].dimensions[1].hierarchies[0].levels[1].asMdxString()).toBe("[D1].[D1].[D1_DESCRIPTION].Members"); 
  expect(datasets[0].dimensions[1].hierarchies[0].levels[1].asMdxString(false)).toBe("[D1].[D1].[D1_DESCRIPTION]"); 
});

test('measures mdx string', () => {
  expect(datasets[0].measures[0].asMdxString()).toBe("[Measures].[F1_M1]");
});

test('cloning', () => {
  datasets.forEach((d: Dataset): void => {
    d.measures.forEach((m: Measure): void => {
      expect(m).toStrictEqual(m.clone());
    });
  });
  datasets.forEach((d: Dataset): void => {
    d.dimensions.forEach((dim: Dimension): void => {
      expect(dim).toStrictEqual(dim.clone());
    });
  });

});

test('foodmart (big)', async () => {
  const fmd = FoodmartMetadata.getInstance();
  await fmd.getMetadata().then((metadata): any => {
    const datasets = Dataset.loadFromMetadata(metadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
    expect(datasets).not.toBeNull();
    expect(datasets.length).toBe(11);
    const storeDataset = datasets[7];
    expect(storeDataset.name).toBe("Store");
    expect(storeDataset.measures).toHaveLength(2);
    expect(storeDataset.dimensions).toHaveLength(4);
  });
});

test('find level on dataset', () => {
  let level = datasets[0].findLevel("[D1].[D1].[D1_DESCRIPTION]");
  expect(level).not.toBeNull();
  expect(level.uniqueName).toBe("[D1].[D1].[D1_DESCRIPTION]");
  level = datasets[0].findLevel("[D1].[D1].[nope]");
  expect(level).toBeNull();
});

test('level hierarchical relationship', async () => {
  const fmd = FoodmartMetadata.getInstance();
  await fmd.getMetadata().then((metadata): any => {
    const datasets = Dataset.loadFromMetadata(metadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
    const storeDataset = datasets[7];
    const stateLevel = storeDataset.findLevel("[Store].[Stores].[Store State]");
    expect(stateLevel).not.toBeNull();
    expect(stateLevel.isHierarchicalDescendantOf("[Store].[Stores].[Store Country]")).toBe(true);
    expect(stateLevel.isHierarchicalDescendantOf("[Store].[Stores].[Store State]")).toBe(false);
    expect(stateLevel.isHierarchicalDescendantOf("[Store].[Stores].[Store City]")).toBe(false);
    expect(stateLevel.isHierarchicalDescendantOf("[Store].[Stores].[Store Name]")).toBe(false);
  });
});
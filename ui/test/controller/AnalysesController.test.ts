import { LocalRepository } from "../../src/js/model/Repository";
import { AnalysesController } from "../../src/js/controller/AnalysesController";
import { Workspace } from "../../src/js/model/Workspace";
import { DatasetAdapterFactory } from "../../src/js/ui/adapters/DatasetAdapterFactory";

let repository: LocalRepository;
let workspace: Workspace;
let controller: AnalysesController;
let viewProperties = AnalysesController.VIEW_PROPERTIES;

beforeEach(async () => {
  repository = new LocalRepository();
  workspace = repository.workspace;
  await repository.init().then(async () => {
    // console.log("Repository initialization complete");
    viewProperties = AnalysesController.VIEW_PROPERTIES;
    controller = new AnalysesController(repository, {
      update(field, value): void {
        if (viewProperties[field] === undefined) {
          throw new Error('Field ' + field + ' does not exist in analyses view properties');
        }
        viewProperties[field] = value;
      }
    });
    await controller.init().then(() => {
      // console.log("Controller initialization complete");
    });
  });
});

test('initial state', () => {
  expect(workspace.analyses).toHaveLength(0);
  expect(controller.analysesDropdownModel.items).toHaveLength(0);
  expect(controller.datasetsDropdownModel.items).toHaveLength(2);
  expect(controller.datasetRootTreeNode).toBeNull();
});

test('new analysis', () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  controller.chooseNewAnalysisDataset();
  expect(viewProperties.showNewAnalysisModal).toBe(false);
  expect(workspace.analyses).toHaveLength(1);
  expect(workspace.analyses.get(0).name).toBe("Analysis 1");
  expect(controller.analysesDropdownModel.selectedIndex.value).toBe(0);
});

test('correct dataset root tree node', () => {
  const datasets = repository.browseDatasets();
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  controller.chooseNewAnalysisDataset();
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 1;
  controller.chooseNewAnalysisDataset();
  expect(workspace.analyses).toHaveLength(2);
  expect(workspace.analyses.get(0).dataset).toBe(datasets.get(0));
  expect(workspace.analyses.get(1).dataset).toBe(datasets.get(1));
  expect(controller.analysesDropdownModel.selectedIndex.value).toBe(1);
  controller.analysesDropdownModel.selectedIndex.value = 0;
  controller.closeCurrentAnalysis();
  expect(workspace.analyses).toHaveLength(1);
  controller.analysesDropdownModel.selectedIndex.value = 0;
  expect(workspace.analyses.get(0).dataset).toBe(datasets.get(1));
  expect(controller.datasetRootTreeNode.label).toBe(DatasetAdapterFactory.buildRootLabel(datasets.get(1).label));
});

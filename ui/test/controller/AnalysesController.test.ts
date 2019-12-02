import { LocalRepository } from "../../src/js/model/Repository";
import { AnalysesController } from "../../src/js/controller/AnalysesController";
import { DatasetAdapterFactory } from "../../src/js/ui/adapters/DatasetAdapterFactory";

let controller: AnalysesController;
const viewProperties = AnalysesController.VIEW_PROPERTIES;

const repository = new LocalRepository();
const workspace = repository.workspace;

beforeAll(async () => {
  await repository.init().then(() => {
    console.log("Repository initialization complete");
  });
});

beforeEach(async () => {
  await repository.refreshWorkspace().then(async () => {
    await repository.refreshDatabase().then(async () => {
      controller = new AnalysesController(repository, {
        update(field, value): void {
          if (viewProperties[field] === undefined) {
            throw new Error('Field ' + field + ' does not exist in analyses view properties');
          }
          viewProperties[field] = value;
        }
      });
      await controller.init().then(() => {
        console.log("Controller initialization complete");
      });
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
  expect(controller.getMenuItemForLabel(AnalysesController.CLOSE_MENU_ITEM_LABEL).enabled).toBe(true);
  expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(false);
  expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(true);
  expect(controller.getMenuItemForLabel(AnalysesController.DELETE_MENU_ITEM_LABEL).enabled).toBe(false);
});

test('correct dataset root tree node', () => {
  const datasets = repository.browseDatasets();
  expect(workspace.analyses).toHaveLength(0);
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

test('close analysis', async () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  controller.chooseNewAnalysisDataset();
  expect(workspace.analyses).toHaveLength(1);
  controller.closeCurrentAnalysis();
  expect(workspace.analyses).toHaveLength(0);
  expect(viewProperties.analysesInWorkspace).toBe(0);
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  controller.chooseNewAnalysisDataset();
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  controller.chooseNewAnalysisDataset();
  expect(workspace.analyses).toHaveLength(2);
  controller.analysesDropdownModel.selectedIndex.value = 0;
  controller.closeCurrentAnalysis();
  expect(workspace.analyses).toHaveLength(1);
  expect(controller.analysesDropdownModel.selectedIndex.value).toBe(0);
});

test('cancel edits', async () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  controller.chooseNewAnalysisDataset();
  expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(false);
  expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(true);
  expect(controller.currentAnalysis.description).toBeNull();
  controller.currentAnalysis.description = "X";
  expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(true);
  controller.cancelEdits();
  expect(controller.currentAnalysis.description).toBeNull();
  expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(false);
});

import { LocalRepository } from "../../src/js/model/Repository";
import { AnalysesController } from "../../src/js/controller/AnalysesController";
import { DatasetAdapterFactory } from "../../src/js/ui/adapters/DatasetAdapterFactory";
import { Workspace } from "../../src/js/model/Workspace";

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

test('new analysis', async () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(() => {
    expect(viewProperties.showNewAnalysisModal).toBe(false);
    expect(workspace.analyses).toHaveLength(1);
    expect(workspace.analyses.get(0).name).toBe("Analysis 1");
    expect(controller.analysesDropdownModel.selectedIndex.value).toBe(0);
    expect(controller.getMenuItemForLabel(AnalysesController.CLOSE_MENU_ITEM_LABEL).enabled).toBe(true);
    expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(false);
    expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(true);
    expect(controller.getMenuItemForLabel(AnalysesController.DELETE_MENU_ITEM_LABEL).enabled).toBe(false);
  });
});

test('rename analysis', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    expect(workspace.analyses.get(0).name).toBe("Analysis 1");
    return workspace.analyses.get(0).setName("A different name...").then(() => {
      expect(workspace.analyses.get(0).name).toBe("A different name...");
    });
  });
});

test('correct dataset root tree node', async () => {
  const datasets = repository.browseDatasets();
  expect(workspace.analyses).toHaveLength(0);
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    controller.newAnalysis();
    controller.datasetsDropdownModel.selectedIndex.value = 1;
    await controller.chooseNewAnalysisDataset().then(() => {
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
  });
});

test('close analysis', async () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    expect(workspace.analyses).toHaveLength(1);
    controller.closeCurrentAnalysis();
    expect(workspace.analyses).toHaveLength(0);
    expect(viewProperties.analysesInWorkspace).toBe(0);
    controller.newAnalysis();
    controller.datasetsDropdownModel.selectedIndex.value = 0;
    await controller.chooseNewAnalysisDataset().then(async () => {
      controller.newAnalysis();
      controller.datasetsDropdownModel.selectedIndex.value = 0;
      await controller.chooseNewAnalysisDataset().then(() => {
        expect(workspace.analyses).toHaveLength(2);
        controller.analysesDropdownModel.selectedIndex.value = 0;
        controller.closeCurrentAnalysis();
        expect(workspace.analyses).toHaveLength(1);
        expect(controller.analysesDropdownModel.selectedIndex.value).toBe(0);
      });
    });
  });
});

test('cancel edits', async () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(false);
    expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(true);
    expect(controller.currentAnalysis.description).toBeNull();
    await controller.currentAnalysis.setDescription("X").then(() => {
      expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(true);
      controller.cancelEdits();
      expect(controller.currentAnalysis.description).toBeNull();
      expect(controller.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL).enabled).toBe(false);
    });
  });
});

test('workspace persistence', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  const newDescription = 'A description...';
  await controller.chooseNewAnalysisDataset().then(async () => {
    await controller.currentAnalysis.setDescription(newDescription).then(async () => {
      expect(controller.currentAnalysis.dirty).toBe(true);
      await controller.saveCurrentAnalysis().then(async () => {
        expect(repository.workspace.analyses.get(0).description).toEqual('A description...');
        return repository.getPersistedWorkspace().then((w: Workspace) => {
          expect(w.analyses.get(0).description).toEqual('A description...');
        });
      });
    });
  });

});

/* eslint-disable jest/no-focused-tests */

test('Basic browse', async () => {
  await controller.browseAnalyses().then(async () => {
    expect(viewProperties.showBrowseAnalysisModal).toBe(true);
    await controller.browseAnalysesOpenSelection(0).then(async () => {
      expect(controller.currentAnalysis.name).toBe("Analysis 1");
      await controller.currentAnalysis.setDescription("A new description...").then(async () => {
        expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(true);
        await controller.saveCurrentAnalysis().then(async () => {
          expect(controller.currentAnalysis.dirty).toBe(false);
          await controller.confirmCloseCurrentAnalysis().then(async () => {
            expect(workspace.analyses).toHaveLength(0);
            expect(viewProperties.analysesInWorkspace).toEqual(0);
            await controller.browseAnalyses().then(async () => {
              expect(viewProperties.showBrowseAnalysisModal).toBe(true);
              await controller.browseAnalysesOpenSelection(0).then(async () => {
                expect(controller.currentAnalysis.description).toBe("A new description...");
                expect(controller.currentAnalysis.dirty).toBe(false);
              });
            });
          });
        });
      });
    }); 
  });

});


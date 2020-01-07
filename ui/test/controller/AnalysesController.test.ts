import { LocalRepository } from "../../src/js/model/Repository";
import { AnalysesController } from "../../src/js/controller/AnalysesController";
import { DatasetAdapterFactory } from "../../src/js/ui/adapters/DatasetAdapterFactory";
import { Workspace } from "../../src/js/model/Workspace";
import { TreeMeasureNodeEvent, TreeLevelNodeEvent } from "../../src/js/ui/model/Tree";
import { QueryMeasure, QueryLevel } from "../../src/js/model/Query";
import { Dataset } from "../../src/js/model/Dataset";
import { LoggerFactory } from "../../src/js/util/LoggerFactory";

let controller: AnalysesController;
const viewProperties = AnalysesController.VIEW_PROPERTIES;

const repository = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));
const workspace = repository.workspace;

beforeAll(async () => {
  await repository.init().then(() => {
    repository.log.info("Repository initialization complete");
  });
});

beforeEach(async () => {
  repository.simulateBrowseDatasetsError = false;
  repository.simulateQueryExecutionError = false;
  await repository.clearWorkspace().then(async () => {
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
        repository.log.info("Controller initialization complete");
      });
    });
  }); 
});

test('initial state', () => {
  expect(workspace.analyses).toHaveLength(0);
  expect(controller.analysesDropdownModel.items).toHaveLength(0);
  expect(controller.datasetsDropdownModel.items).toHaveLength(6);
  expect(controller.datasetRootTreeNode).toBeNull();
  expect(viewProperties.errorModalMessage).toBeNull();
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
  return repository.browseDatasets().then(async (datasets: Dataset[]) => {
    expect(workspace.analyses).toHaveLength(0);
    controller.newAnalysis();
    controller.datasetsDropdownModel.selectedIndex.value = 0;
    await controller.chooseNewAnalysisDataset().then(async () => {
      controller.newAnalysis();
      controller.datasetsDropdownModel.selectedIndex.value = 1;
      await controller.chooseNewAnalysisDataset().then(async () => {
        expect(workspace.analyses).toHaveLength(2);
        expect(workspace.analyses.get(0).dataset).toBe(datasets[0]);
        expect(workspace.analyses.get(1).dataset).toBe(datasets[1]);
        expect(controller.analysesDropdownModel.selectedIndex.value).toBe(1);
        controller.analysesDropdownModel.selectedIndex.value = 0;
        await controller.closeCurrentAnalysis().then(() => {
          expect(workspace.analyses).toHaveLength(1);
          controller.analysesDropdownModel.selectedIndex.value = 0;
          expect(workspace.analyses.get(0).dataset).toBe(datasets[1]);
          expect(controller.datasetRootTreeNode.label).toBe(DatasetAdapterFactory.buildRootLabel(datasets[1]));
        });
      });
    });
    });
});

test('close analysis', async () => {
  controller.newAnalysis();
  expect(viewProperties.showNewAnalysisModal).toBe(true);
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    expect(workspace.analyses).toHaveLength(1);
    await controller.closeCurrentAnalysis().then(async () => {
      expect(workspace.analyses).toHaveLength(0);
      expect(viewProperties.analysesInWorkspace).toBe(0);
      controller.newAnalysis();
      controller.datasetsDropdownModel.selectedIndex.value = 0;
      await controller.chooseNewAnalysisDataset().then(async () => {
        controller.newAnalysis();
        controller.datasetsDropdownModel.selectedIndex.value = 0;
        await controller.chooseNewAnalysisDataset().then(async () => {
          expect(workspace.analyses).toHaveLength(2);
          controller.analysesDropdownModel.selectedIndex.value = 0;
          await controller.closeCurrentAnalysis();
          expect(workspace.analyses).toHaveLength(1);
          expect(controller.analysesDropdownModel.selectedIndex.value).toBe(0);
        });
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

test('Saving makes clean', async () => {
  await controller.browseAnalyses().then(async () => {
    expect(viewProperties.showBrowseAnalysisModal).toBe(true);
    await controller.browseAnalysesOpenSelection(0).then(async () => {
      expect(controller.currentAnalysis.name).toBe("Analysis 1");
      await controller.currentAnalysis.setDescription("A new description...").then(async () => {
        expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(true);
        await controller.saveCurrentAnalysis().then(async () => {
          expect(controller.currentAnalysis.dirty).toBe(false);
          expect(controller.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL).enabled).toBe(false);
        });
      });
    }); 
  });
});

test('Dataset tree model query test: measure events', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    const event = new TreeMeasureNodeEvent("[Measures].[F1_M1]", true);
    await controller.handleDatasetTreeNodeEvent(event).then(async () => {
      expect(controller.currentAnalysis.query.measures).toHaveLength(1);
      expect(controller.currentAnalysis.query.asMDX()).toBe("SELECT NON EMPTY {[Measures].[F1_M1]} ON COLUMNS FROM [Test]");
      event.selected = false;
      await controller.handleDatasetTreeNodeEvent(event).then(async () => {
        expect(controller.currentAnalysis.query.measures).toHaveLength(0);
        expect(controller.currentAnalysis.query.asMDX()).toBeNull();
      });
    });
  });
});

test('Dataset tree model query test: level events', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    const measureEvent = new TreeMeasureNodeEvent("[Measures].[F1_M1]", true);
    await controller.handleDatasetTreeNodeEvent(measureEvent).then(async () => {
      const levelEvent = new TreeLevelNodeEvent("[D1].[D1].[D1_DESCRIPTION]", true, true, false);
      await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
        expect(controller.currentAnalysis.query.levels).toHaveLength(1);
        expect(controller.currentAnalysis.query.asMDX()).toBe("SELECT NON EMPTY {[Measures].[F1_M1]} ON COLUMNS, NON EMPTY {[D1].[D1].[D1_DESCRIPTION].Members} ON ROWS FROM [Test]");
        levelEvent.rowOrientation = false;
        await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
          expect(controller.currentAnalysis.query.asMDX()).toBe("SELECT NON EMPTY NonEmptyCrossJoin({[D1].[D1].[D1_DESCRIPTION].Members},{[Measures].[F1_M1]}) ON COLUMNS FROM [Test]");
          levelEvent.selected = false;
          await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
            expect(controller.currentAnalysis.query.levels).toHaveLength(0);
            expect(controller.currentAnalysis.query.asMDX()).toBe("SELECT NON EMPTY {[Measures].[F1_M1]} ON COLUMNS FROM [Test]");
          });
        });
      });
    });
  });
});

test('Dataset tree node workspace persistence', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    const queryMeasure = new QueryMeasure(controller.currentAnalysis.query);
    queryMeasure.setUniqueName("[Measures].[F1_M1]");
    await controller.currentAnalysis.query.measures.add(queryMeasure).then(async () => {
      await repository.getPersistedWorkspace().then(async (w: Workspace) => { 
        expect(w.analyses.get(0).query.measures).toHaveLength(1);
        const queryLevel = new QueryLevel(controller.currentAnalysis.query);
        queryLevel.setUniqueName("[D1].[D1].[D1_DESCRIPTION");
        queryLevel.setRowOrientation(true);
        await controller.currentAnalysis.query.levels.add(queryLevel).then(async () => {
          await repository.getPersistedWorkspace().then(async (w: Workspace) => { 
            expect(w.analyses.get(0).query.measures).toHaveLength(1);
            expect(w.analyses.get(0).query.levels).toHaveLength(1);
            expect(w.analyses.get(0).query.levels.get(0).uniqueName).toBe(queryLevel.uniqueName);
            expect(w.analyses.get(0).query.levels.get(0).rowOrientation).toBe(true);
            await queryLevel.setRowOrientation(false).then(async () => {
              await repository.getPersistedWorkspace().then(async (w: Workspace) => { 
                expect(w.analyses.get(0).query.measures).toHaveLength(1);
                expect(w.analyses.get(0).query.levels).toHaveLength(1);
                expect(w.analyses.get(0).query.levels.get(0).uniqueName).toBe(queryLevel.uniqueName);
                expect(w.analyses.get(0).query.levels.get(0).rowOrientation).toBe(false);
                await controller.currentAnalysis.query.levels.removeAt(0).then(async () => {
                  await repository.getPersistedWorkspace().then(async (w: Workspace) => { 
                    expect(w.analyses.get(0).query.measures).toHaveLength(1);
                    expect(w.analyses.get(0).query.levels).toHaveLength(0);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

test('Dataset tree model query test: filters', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    let levelEvent = new TreeLevelNodeEvent("[D1].[D1].[D1_DESCRIPTION]", true, true, false);
    await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
      expect(controller.currentAnalysis.query.levels).toHaveLength(1);
      expect(controller.currentAnalysis.query.filters).toHaveLength(0);
      expect(controller.currentAnalysis.query.levels.get(0).filterActive).toBe(false);
      levelEvent = new TreeLevelNodeEvent("[D1].[D1].[D1_DESCRIPTION]", true, true, true);
      await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
        expect(viewProperties.showQueryFilterModal).toBe(true);
        expect(controller.queryFilterTableModel.rowCount).toBe(2);
        expect(controller.queryFilterTableModel.filterModeInclude).toBe(true);
        expect(controller.queryFilterTableModel.selectedMemberNames).toHaveLength(0);
        controller.queryFilterTableModel.toggleRowAt(0);
        expect(controller.queryFilterTableModel.selectedMemberNames).toHaveLength(1);
        expect(controller.queryFilterTableModel.getRowSelectedAt(0)).toBe(true);
        expect(controller.queryFilterTableModel.getRowSelectedAt(1)).toBe(false);
        await controller.closeQueryFilterModal(false).then(async () => {
          expect(viewProperties.showQueryFilterModal).toBe(false);
          expect(controller.currentAnalysis.query.filters).toHaveLength(0);
          expect(controller.currentAnalysis.query.levels.get(0).filterActive).toBe(false);
          await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
            expect(controller.queryFilterTableModel.filterModeInclude).toBe(true);
            expect(controller.queryFilterTableModel.getRowSelectedAt(0)).toBe(false);
            controller.queryFilterTableModel.toggleRowAt(0);
            expect(controller.queryFilterTableModel.getRowSelectedAt(0)).toBe(true);
            expect(controller.queryFilterTableModel.selectedMemberNames).toHaveLength(1);
            await controller.closeQueryFilterModal(true).then(async () => {
              expect(controller.currentAnalysis.query.filters).toHaveLength(1);
              expect(viewProperties.showQueryFilterModal).toBe(false);
              expect(controller.currentAnalysis.query.levels.get(0).filterActive).toBe(true);
              await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
                expect(viewProperties.showQueryFilterModal).toBe(true);
                expect(controller.queryFilterTableModel.getRowSelectedAt(0)).toBe(true);
                controller.queryFilterTableModel.toggleRowAt(0);
                expect(controller.queryFilterTableModel.getRowSelectedAt(0)).toBe(false);
                await controller.closeQueryFilterModal(true).then(async () => {
                  expect(controller.currentAnalysis.query.filters).toHaveLength(1); // filter is still there, just no selected member names
                  expect(viewProperties.showQueryFilterModal).toBe(false);
                  expect(controller.currentAnalysis.query.levels.get(0).filterActive).toBe(false);
                  await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
                    controller.queryFilterTableModel.filterModeInclude = false;
                    await controller.closeQueryFilterModal(true).then(async () => {
                      expect(controller.currentAnalysis.query.filters.get(0).include).toBe(false);
                      await controller.handleDatasetTreeNodeEvent(levelEvent).then(async () => {
                        expect(controller.queryFilterTableModel.filterModeInclude).toBe(false);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

test('controller init browseDatasets error', async () => {
  repository.simulateBrowseDatasetsError = true;
  return controller.init().then(() => {
    expect(viewProperties.errorModalMessage).toMatch(/simulated.+error/);
  });
});

test('execute query with error', async () => {
  controller.newAnalysis();
  controller.datasetsDropdownModel.selectedIndex.value = 0;
  await controller.chooseNewAnalysisDataset().then(async () => {
    const event = new TreeMeasureNodeEvent("[Measures].[F1_M1]", true);
    repository.simulateQueryExecutionError = true;
    await controller.handleDatasetTreeNodeEvent(event).then(async () => {
      expect(viewProperties.errorModalMessage).toMatch(/simulated.+error/);
    });
  });
});


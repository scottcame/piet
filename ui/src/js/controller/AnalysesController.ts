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

import { Repository, RepositoryError, RepositoryErrorType } from "../model/Repository";
import { Workspace } from "../model/Workspace";
import { DropdownModel } from "../ui/model/Dropdown";
import { Analysis } from "../model/Analysis";
import { QueryMeasure, QueryLevel, QueryFilter } from "../model/Query";
import { DatasetAdapterFactory } from "../ui/adapters/DatasetAdapterFactory";
import { TreeModelContainerNode, TreeModelLeafNodeType, TreeLevelNodeEvent, TreeEvent } from "../ui/model/Tree";
import { Dataset } from "../model/Dataset";
import { List, ListChangeEvent } from "../collections/List";
import { AnalysisAdapterFactory } from "../ui/adapters/AnalysisAdapterFactory";
import { TableModel } from "../ui/model/Table";
import { EditEventListener, EditEvent, PropertyEditEvent } from "../model/Persistence";
import { DefaultObservableChangeEventListener, ObservableChangeEvent } from "../util/Observable";
import { MondrianResult } from "../model/MondrianResult";
import { MondrianResultTableModel } from "../ui/model/MondrianResultTable";
import { QueryFilterTableModel } from "../ui/model/QueryFilterTableModel";
import { MondrianResultVizModel } from "../ui/model/MondrianResultVegaViz";

export class AnalysesController {

  static VIEW_PROPERTIES = {
    showNewAnalysisModal: false,
    analysesInWorkspace: 0,
    datasetSelected: false,
    datasetRootTreeModelNode: null,
    currentAnalysis: null,
    showBrowseAnalysisModal: false,
    showAnalysisMetadataModal: false,
    showAbandonEditsModal: false,
    showDeleteConfirmationModal: false,
    showQueryFilterModal: false,
    errorModalMessage: null,
    executeQueryErrorModalType: null,
    executingQuery: false
  };

  static CANCEL_EDITS_MENU_ITEM_LABEL = "Cancel edits";
  static SAVE_MENU_ITEM_LABEL = "Save";
  static DELETE_MENU_ITEM_LABEL = "Delete";
  static EDIT_METADATA_MENU_ITEM_LABEL = "Properties...";
  static CLOSE_MENU_ITEM_LABEL = "Close";

  readonly repository: Repository;
  private readonly workspace: Workspace;

  currentAnalysis: Analysis;

  analysesDropdownModel: DropdownModel<Analysis>;
  datasetRootTreeNode: TreeModelContainerNode;
  datasetsDropdownModel: DropdownModel<Dataset>;
  browseAnalysesTableModel: TableModel<Analysis>;
  mondrianResultTableModel: MondrianResultTableModel;
  mondrianResultVegaViz: MondrianResultVizModel;
  queryFilterTableModel: QueryFilterTableModel;

  datasets: List<Dataset>;

  private currentAnalysisEditListener: EditEventListener;

  menuItems = [
    { label: AnalysesController.EDIT_METADATA_MENU_ITEM_LABEL, action: (_e: MouseEvent): void => { this.openEditAnalysisMetadataModal(); }, enabled: true },
    { label: AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL, action: (_e: MouseEvent): void => { this.cancelEdits(); }, enabled: false },
    { label: AnalysesController.SAVE_MENU_ITEM_LABEL, action: (_e: MouseEvent): void => { this.saveCurrentAnalysis(); }, enabled: false },
    { label: AnalysesController.CLOSE_MENU_ITEM_LABEL, action: (_e: MouseEvent): void => { this.closeCurrentAnalysis(); }, enabled: true },
    { label: AnalysesController.DELETE_MENU_ITEM_LABEL, action: (_e: MouseEvent): void => { this.deleteCurrentAnalysis(); }, enabled: false },
  ];

  private viewPropertyUpdater: ViewPropertyUpdater;

  constructor(repository: Repository, viewPropertyUpdater: ViewPropertyUpdater) {
    this.viewPropertyUpdater = viewPropertyUpdater;
    this.repository = repository;
    this.workspace = repository.workspace;
    this.datasetRootTreeNode = null;
    this.currentAnalysisEditListener = new CurrentAnalysisEditListener(this, viewPropertyUpdater);
    this.datasets = new List();
    this.mondrianResultTableModel = new MondrianResultTableModel();
    this.mondrianResultVegaViz = new MondrianResultVizModel();
    this.queryFilterTableModel = new QueryFilterTableModel();
  }

  async init(): Promise<void> {

    return this.repository.browseDatasets().then(async (repoDatasets: Dataset[]) => {

      return this.datasets.set(repoDatasets).then(() => {

        this.datasetsDropdownModel = new DropdownModel(this.datasets, "label");
        this.browseAnalysesTableModel = new TableModel<Analysis>(AnalysisAdapterFactory.COLUMN_LABELS);
        this.analysesDropdownModel  = new DropdownModel(this.workspace.analyses, "name");

        /* eslint-disable @typescript-eslint/no-this-alias */
        const self = this;

        this.viewPropertyUpdater.update("errorModalMessage", null);
        this.viewPropertyUpdater.update("executingQuery", false);
        this.viewPropertyUpdater.update("analysesInWorkspace", this.workspace.analyses.length);

        this.workspace.analyses.addChangeEventListener({
          listChanged(_event: ListChangeEvent): Promise<void> {
            self.viewPropertyUpdater.update("analysesInWorkspace", self.workspace.analyses.length);
            return Promise.resolve();
          },
          listWillChange(_event: ListChangeEvent): Promise<void> {
            return Promise.resolve();
          }
        });

        this.analysesDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => this.handleAnalysisSelection(e)));

        this.datasetsDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
          this.viewPropertyUpdater.update("datasetSelected", e.newValue !== null);
        }));

      });

    }).catch((error: RepositoryError) => {
      this.viewPropertyUpdater.update("errorModalMessage", error.message);
    });

  }

  updateCancelEditsMenuItem(): void {
    const item = this.getMenuItemForLabel(AnalysesController.CANCEL_EDITS_MENU_ITEM_LABEL);
    if (item) {
      item.enabled = this.currentAnalysis.dirty;
    }
  }

  updateSaveAnalysisMenuItem(): void {
    const item = this.getMenuItemForLabel(AnalysesController.SAVE_MENU_ITEM_LABEL);
    if (item) {
      item.enabled = this.currentAnalysis.dirty || !this.currentAnalysis.inRepository();
    }
  }

  updateDeleteAnalysisMenuItem(): void {
    const item = this.getMenuItemForLabel(AnalysesController.DELETE_MENU_ITEM_LABEL);
    if (item) {
      item.enabled = this.currentAnalysis.inRepository();
    }
  }

  getMenuItemForLabel(label: string): { label: string; action: (e: MouseEvent) => void; enabled: boolean } {
    const items = this.menuItems.filter((item) => item.label===label);
    let ret = null;
    if (items.length) {
      ret = items[0];
    }
    return ret;
  }

  handleAnalysisSelection(_event: ObservableChangeEvent<number>): void {
    if (this.currentAnalysis) {
      this.currentAnalysis.removeEditEventListener(this.currentAnalysisEditListener);
    }
    this.currentAnalysis = this.analysesDropdownModel.selectedItem;
    if (this.currentAnalysis) {

      const selectedIndex = this.analysesDropdownModel.selectedIndex.value;
      this.currentAnalysis.addEditEventListener(this.currentAnalysisEditListener);
      this.updateCancelEditsMenuItem();
      this.updateSaveAnalysisMenuItem();
      this.updateDeleteAnalysisMenuItem();

      // may need to look at caching these in the future; some datasets have a long and deep metadata tree...
      this.datasetRootTreeNode = DatasetAdapterFactory.getInstance().createRootTreeModelNode(this.workspace.analyses.get(selectedIndex).dataset);
      this.viewPropertyUpdater.update("datasetRootTreeModelNode", this.datasetRootTreeNode);

      this.executeQuery();

    } else {
      this.viewPropertyUpdater.update("datasetRootTreeModelNode", null);
    }
    this.viewPropertyUpdater.update("currentAnalysis", this.currentAnalysis);
  }

  async closeCurrentAnalysis(): Promise<Analysis> {
    if (this.currentAnalysis.dirty) {
      this.viewPropertyUpdater.update('showAbandonEditsModal', true);
    } else {
      return this.confirmCloseCurrentAnalysis();
    }
  }

  async abandonEdits(confirm: boolean): Promise<Analysis> {
    if (confirm) {
      this.viewPropertyUpdater.update('showAbandonEditsModal', false);
      return this.confirmCloseCurrentAnalysis();
    } else {
      this.viewPropertyUpdater.update('showAbandonEditsModal', false);
    }
  }

  async confirmCloseCurrentAnalysis(): Promise<Analysis> {
    return this.workspace.analyses.removeAt(this.analysesDropdownModel.selectedIndex.value);
  }

  deleteCurrentAnalysis(): void {
    this.viewPropertyUpdater.update('showDeleteConfirmationModal', true);
  }

  async confirmDelete(confirm: boolean): Promise<void> {
    if (confirm) {
      return this.repository.deleteAnalysis(this.currentAnalysis).then(async () => {
        return this.confirmCloseCurrentAnalysis().then(() => {
          this.viewPropertyUpdater.update('showDeleteConfirmationModal', false);
        });
      });
    } else {
      this.viewPropertyUpdater.update('showDeleteConfirmationModal', false);
      return Promise.resolve();
    }
  }

  async cancelEdits(): Promise<void> {
    return this.currentAnalysis.cancelEdits().then(async () => {
      return this.executeQuery();
    });
  }

  newAnalysis(): void {
    this.viewPropertyUpdater.update('showNewAnalysisModal', true);
  }

  closeNewAnalysisModal(): void {
    this.viewPropertyUpdater.update('showNewAnalysisModal', false);
    this.datasetsDropdownModel.selectedIndex.value = null;
  }

  async browseAnalyses(): Promise<void> {
    return this.repository.browseAnalyses().then((repoAnalyses: Analysis[]) => {
      this.browseAnalysesTableModel.setRowList(AnalysisAdapterFactory.getInstance().getAnalysesRowList(repoAnalyses, this.workspace.analyses));
      this.viewPropertyUpdater.update('showBrowseAnalysisModal', true);
    });
  }

  closeBrowseAnalysisModal(): void {
    this.viewPropertyUpdater.update('showBrowseAnalysisModal', false);
  }

  async browseAnalysesOpenSelection(browseAnalysesSelectedIndex: number): Promise<void> {
    if (browseAnalysesSelectedIndex !== null) {
      return this.workspace.analyses.add(this.browseAnalysesTableModel.getRowAt(browseAnalysesSelectedIndex).getItem()).then(() => {
        this.analysesDropdownModel.selectedIndex.value = this.workspace.analyses.length-1;
        this.closeBrowseAnalysisModal();
      });
    }
    return Promise.resolve();
  }

  async chooseNewAnalysisDataset(): Promise<void> {
    if (this.datasetsDropdownModel.selectedItem) {
      const currentAnalysisCount = this.workspace.analyses.length;
      return this.workspace.analyses.add(new Analysis(this.datasetsDropdownModel.selectedItem, "Analysis " + (currentAnalysisCount+1))).then(() => {
        this.closeNewAnalysisModal();
      });
    }
    return Promise.resolve();
  }

  async saveCurrentAnalysis(): Promise<void> {
    let ret = Promise.resolve();
    if (this.currentAnalysis !== null) {
      ret = this.currentAnalysis.checkpointEdits().then(async () => {
        return this.repository.saveAnalysis(this.currentAnalysis).then(async (newId) => {
          if (!this.currentAnalysis.id) {
            this.currentAnalysis.id = newId;
            // have to call these explicitly because this.currentAnalysisEditListener wont pick up edits to the id (it's not observed)
            this.updateSaveAnalysisMenuItem();
            this.updateCancelEditsMenuItem();
          }
        });
      });
    }
    return ret;
  }

  closeEditAnalysisMetadataModal(): void {
    this.viewPropertyUpdater.update('showAnalysisMetadataModal', false);
  }

  openEditAnalysisMetadataModal(): void {
    this.viewPropertyUpdater.update('showAnalysisMetadataModal', true);
  }

  async closeQueryFilterModal(editsMade: boolean): Promise<void> {
    if (editsMade) {
      const selectedMemberNames = this.queryFilterTableModel.selectedMemberNames;
      const filterModeInclude = this.queryFilterTableModel.filterModeInclude;
      let qf = this.currentAnalysis.query.findFilter(this.queryFilterTableModel.levelUniqueName);
      let firstStep = Promise.resolve(qf);
      if (!qf) {
        qf = new QueryFilter(this.queryFilterTableModel.levelUniqueName, this.currentAnalysis.query);
        firstStep = this.currentAnalysis.query.filters.add(qf);
      }
      return firstStep.then(async (qf: QueryFilter) => {
        return qf.update(false, filterModeInclude, selectedMemberNames).then(() => {
          this.viewPropertyUpdater.update('showQueryFilterModal', false);
          return this.executeQuery();
        });
      });
    }
    this.viewPropertyUpdater.update('showQueryFilterModal', false);
    return Promise.resolve();
  }

  async confirmEditAnalysisMetadata(analysisTitle: string, analysisDescription: string): Promise<void> {
    // todo: handle validation logic...Modal.svelte needs to be passed some kind of validation class...
    const promises: Promise<void>[] = [];
    promises.push(this.currentAnalysis.setName(analysisTitle));
    if (!analysisDescription || !analysisDescription.trim().length) {
      promises.push(this.currentAnalysis.setDescription(null));
    } else {
      promises.push(this.currentAnalysis.setDescription(analysisDescription.trim()));
    }
    return Promise.all(promises).then(() => {
      this.closeEditAnalysisMetadataModal();
      return this.executeQuery();
    });
  }

  async toggleNonEmpty(): Promise<void> {
    return this.currentAnalysis.setNonEmpty(!this.currentAnalysis.nonEmpty);
  }

  async toggleFilterParentAggregates(): Promise<void> {
    return this.currentAnalysis.setFilterParentAggregates(!this.currentAnalysis.filterParentAggregates);
  }

  async handleDatasetTreeNodeEvent(event: TreeEvent): Promise<void> {

    let ret = Promise.resolve();
    let executeQueryAfter = true;

    if (event.type === TreeModelLeafNodeType.MEASURE) {
      if (event.selected) {
        const queryMeasure = new QueryMeasure(this.currentAnalysis.query);
        queryMeasure.setUniqueName(event.uniqueName);
        ret = this.currentAnalysis.query.measures.add(queryMeasure).then();
      } else {
        const existingMeasures = this.currentAnalysis.query.measures.filter((measure: QueryMeasure): boolean => {
          return measure.uniqueName === event.uniqueName;
        });
        if (existingMeasures.length) {
          ret = this.currentAnalysis.query.measures.remove(existingMeasures.get(0)).then();
        }
      }
    } else {
      const treeModelLevelNodeEvent = event as TreeLevelNodeEvent;
      if (event.selected) {
        const existingLevels = this.currentAnalysis.query.levels.filter((level: QueryLevel): boolean => {
          return level.uniqueName === treeModelLevelNodeEvent.uniqueName;
        });
        if (treeModelLevelNodeEvent.filterSelected) {
          this.queryFilterTableModel.init(this.currentAnalysis, treeModelLevelNodeEvent.uniqueName);
          this.viewPropertyUpdater.update('showQueryFilterModal', true);
          executeQueryAfter = false; // we don't want to execute the query now, because we need to do it after the query filter modal is closed
        } else {
          let queryLevel: QueryLevel = null;
          if (existingLevels.length) {
            queryLevel = existingLevels.get(0);
            const promises: Promise<void>[] = [
              queryLevel.setRowOrientation(treeModelLevelNodeEvent.rowOrientation)
            ];
            ret = Promise.all(promises).then(() => {
              return Promise.resolve();
            });
          } else {
            queryLevel = new QueryLevel(this.currentAnalysis.query);
            queryLevel.setUniqueName(treeModelLevelNodeEvent.uniqueName);
            ret = this.currentAnalysis.query.levels.add(queryLevel).then();
          }
        }
      } else {
        const existingLevels = this.currentAnalysis.query.levels.filter((level: QueryLevel): boolean => {
          return level.uniqueName === treeModelLevelNodeEvent.uniqueName;
        });
        if (existingLevels.length) {
          ret = this.currentAnalysis.query.levels.remove(existingLevels.get(0)).then();
        }
      }
    }

    return ret.then(() => {
      return executeQueryAfter ? this.executeQuery() : Promise.resolve();
    });

  }

  async executeQuery(): Promise<void> {
    let ret = Promise.resolve();
    if (this.currentAnalysis) {
      const mdx = this.currentAnalysis.query.asMDX();
      const dataset = this.currentAnalysis.dataset;
      this.viewPropertyUpdater.update("executingQuery", true);
      ret = this.repository.executeQuery(mdx, dataset).then((result: MondrianResult): void => {
        this.mondrianResultTableModel.result = result;
        this.mondrianResultVegaViz.result = result;
      }).catch((error: RepositoryError) => {
        this.mondrianResultTableModel.result = null;
        this.mondrianResultVegaViz.result = null;
        if (error.type === RepositoryErrorType.QUERY_TIMEOUT) {
          this.viewPropertyUpdater.update("executeQueryErrorModalType", "timeout");
        } else if (error.type === RepositoryErrorType.QUERY_ERROR) {
          this.viewPropertyUpdater.update("executeQueryErrorModalType", "parse");
        } else {
          this.viewPropertyUpdater.update("errorModalMessage", error.message);
        }
      }).finally(() => {
        this.viewPropertyUpdater.update("executingQuery", false);
      });
    } else {
      this.mondrianResultTableModel.result = null;
      this.mondrianResultVegaViz.result = null;
    }
    return ret;
  }

  async undoLastAnalysisEdit(): Promise<void> {
    if (this.currentAnalysis.undoAvailable) {
      return this.currentAnalysis.undo().then(async () => {
        this.viewPropertyUpdater.update("executeQueryErrorModalType", null);
        return this.executeQuery();
      });
    }
    return this.repository.workspace.analyses.remove(this.currentAnalysis).then(async () => {
      return Promise.resolve();
    });
  }

}

class CurrentAnalysisEditListener implements EditEventListener {
  private controller: AnalysesController;
  private viewPropertyUpdater: ViewPropertyUpdater;
  constructor(controller: AnalysesController, viewPropertyUpdater: ViewPropertyUpdater) {
    this.controller = controller;
    this.viewPropertyUpdater = viewPropertyUpdater;
  }
  notifyEdit(_event: EditEvent): Promise<void> {
    this.controller.updateCancelEditsMenuItem();
    this.controller.updateSaveAnalysisMenuItem();
    this.controller.updateDeleteAnalysisMenuItem();
    return Promise.resolve();
  }
  notifyPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    this.viewPropertyUpdater.update("currentAnalysis", this.controller.currentAnalysis);
    return Promise.resolve();
  }
  notifyPendingPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    return Promise.resolve();
  }
}

interface ViewPropertyUpdater {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  update(field: string, value: any): void;
}

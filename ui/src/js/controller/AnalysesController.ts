import { Repository } from "../model/Repository";
import { Workspace } from "../model/Workspace";
import { DropdownModel } from "../ui/model/Dropdown";
import { Analysis } from "../model/Analysis";
import { QueryMeasure, QueryLevel } from "../model/Query";
import { DatasetAdapterFactory } from "../ui/adapters/DatasetAdapterFactory";
import { TreeModelContainerNode, TreeModelEvent, TreeModelLeafNodeType, TreeModelLevelNodeEvent } from "../ui/model/Tree";
import { Dataset } from "../model/Dataset";
import { List, ListChangeEvent } from "../collections/List";
import { AnalysisAdapterFactory } from "../ui/adapters/AnalysisAdapterFactory";
import { TableModel } from "../ui/model/Table";
import { EditEventListener, EditEvent, PropertyEditEvent } from "../model/Persistence";
import { DefaultObservableChangeEventListener, ObservableChangeEvent } from "../util/Observable";
import { MondrianResult } from "../model/MondrianResult";
import { MondrianResultTableModel } from "../ui/model/MondrianResultTable";

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
    showDeleteConfirmationModal: false
  };

  static CANCEL_EDITS_MENU_ITEM_LABEL = "Cancel edits";
  static SAVE_MENU_ITEM_LABEL = "Save";
  static DELETE_MENU_ITEM_LABEL = "Delete";
  static EDIT_METADATA_MENU_ITEM_LABEL = "Edit metadata...";
  static CLOSE_MENU_ITEM_LABEL = "Close";

  readonly repository: Repository;
  private readonly workspace: Workspace;

  currentAnalysis: Analysis;

  analysesDropdownModel: DropdownModel<Analysis>;
  datasetRootTreeNode: TreeModelContainerNode;
  datasetsDropdownModel: DropdownModel<Dataset>;
  browseAnalysesTableModel: TableModel<Analysis>;
  mondrianResultTableModel: MondrianResultTableModel;

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
  }

  async init(): Promise<void> {

    return this.repository.browseDatasets().then((repoDatasets: Dataset[]) => {

      return this.datasets.set(repoDatasets).then(() => {
        this.datasetsDropdownModel = new DropdownModel(this.datasets, "label");
        this.browseAnalysesTableModel = new TableModel<Analysis>(AnalysisAdapterFactory.COLUMN_LABELS);
        this.analysesDropdownModel  = new DropdownModel(this.workspace.analyses, "name");
    
        /* eslint-disable @typescript-eslint/no-this-alias */
        const self = this;
    
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
        const newId = await this.repository.saveAnalysis(this.currentAnalysis);
        if (this.currentAnalysis.id === undefined) {
          this.currentAnalysis.id = newId;
        }
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

  async confirmEditAnalysisMetadata(analysisTitle: string, analysisDescription: string): Promise<void> {
    // todo: handle validation logic...Modal.svelte needs to be passed some kind of validation class...
    const promises: Promise<void>[] = [];
    promises.push(this.currentAnalysis.setName(analysisTitle));
    if (!analysisDescription || !analysisDescription.trim().length) {
      promises.push(this.currentAnalysis.setDescription(null));
    } else {
      promises.push(this.currentAnalysis.setDescription(analysisDescription.trim()));
    }
    await Promise.all(promises);
    this.closeEditAnalysisMetadataModal();
  }

  async handleDatasetTreeNodeEvent(event: TreeModelEvent): Promise<void> {

    let ret = Promise.resolve();

    if (event.type === TreeModelLeafNodeType.MEASURE) {
      if (event.selected) {
        const queryMeasure = new QueryMeasure();
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
      const treeModelLevelNodeEvent = event as TreeModelLevelNodeEvent;
      if (event.selected) {
        const existingLevels = this.currentAnalysis.query.levels.filter((level: QueryLevel): boolean => {
          return level.uniqueName === treeModelLevelNodeEvent.uniqueName;
        });
        let queryLevel: QueryLevel = null;
        if (existingLevels.length) {
          queryLevel = existingLevels.get(0);
          const promises: Promise<void>[] = [
            queryLevel.setFilterSelected(treeModelLevelNodeEvent.filterSelected),
            queryLevel.setRowOrientation(treeModelLevelNodeEvent.rowOrientation),
            queryLevel.setSumSelected(treeModelLevelNodeEvent.sumSelected)
          ];
          ret = Promise.all(promises).then(() => {
            return Promise.resolve();
          });
        } else {
          queryLevel = new QueryLevel();
          queryLevel.setUniqueName(treeModelLevelNodeEvent.uniqueName);
          ret = this.currentAnalysis.query.levels.add(queryLevel).then();
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
      return this.executeQuery();
    });

  }

  async executeQuery(): Promise<void> {
    let ret = Promise.resolve();
    if (this.currentAnalysis) {
      const mdx = this.currentAnalysis.query.asMDX();
      const dataset = this.currentAnalysis.dataset;
      ret = this.repository.executeQuery(mdx, dataset).then((result: MondrianResult): void => {
        this.mondrianResultTableModel.result = result;
      });
    } else {
      this.mondrianResultTableModel.result = null;
    }
    return ret;
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
}

interface ViewPropertyUpdater {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  update(field: string, value: any): void;
}

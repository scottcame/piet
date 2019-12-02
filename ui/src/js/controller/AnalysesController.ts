import { Repository } from "../model/Repository";
import { Workspace } from "../model/Workspace";
import { DropdownModel } from "../ui/model/Dropdown";
import { Analysis } from "../model/Analysis";
import { DatasetAdapterFactory } from "../ui/adapters/DatasetAdapterFactory";
import { TreeModelContainerNode } from "../ui/model/Tree";
import { Dataset } from "../model/Dataset";
import { List, DefaultListChangeEventListener } from "../collections/List";
import { AnalysisAdapterFactory } from "../ui/adapters/AnalysisAdapterFactory";
import { TableModel } from "../ui/model/Table";
import { EditEventListener, EditEvent, PropertyEditEvent } from "../model/Persistence";
import { DefaultObservableChangeEventListener, ObservableChangeEvent } from "../util/Observable";

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
  static CLOSE_MENU_ITEM_LABEL = "Edit metadata...";

  readonly repository: Repository;
  private readonly workspace: Workspace;

  currentAnalysis: Analysis;

  analysesDropdownModel: DropdownModel<Analysis>;
  datasetRootTreeNode: TreeModelContainerNode;
  datasetsDropdownModel: DropdownModel<Dataset>;
  browseAnalysesTableModel: TableModel<Analysis>;

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
  }

  init(): Promise<void> {
    return new Promise((resolve, _reject) => {

      this.analysesDropdownModel  = new DropdownModel(this.workspace.analyses, "name");
      this.datasets = this.repository.browseDatasets(); // todo: this will have to change when browse returns a promise (i.e. datasets aren't statically populated)
      this.datasetsDropdownModel = new DropdownModel(this.datasets, "label");
      this.browseAnalysesTableModel = AnalysisAdapterFactory.getInstance().getTableModel(this.repository.analyses, this.workspace.analyses);

      this.viewPropertyUpdater.update("analysesInWorkspace", this.workspace.analyses.length);
      this.workspace.analyses.addChangeEventListener(new DefaultListChangeEventListener(_e => {
        this.viewPropertyUpdater.update("analysesInWorkspace", this.workspace.analyses.length);
      }));

      this.analysesDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => this.handleAnalysisSelection(e)));

      this.datasetsDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
        this.viewPropertyUpdater.update("datasetSelected", e.newValue !== null);
      }));

      resolve();

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
    const selectedIndex = this.analysesDropdownModel.selectedIndex.value;
    if (selectedIndex === null) {
      this.viewPropertyUpdater.update("datasetRootTreeModelNode", null);
    } else {
      // may need to look at caching these in the future; some datasets have a long and deep metadata tree...
      this.datasetRootTreeNode = DatasetAdapterFactory.getInstance().createRootTreeModelNode(this.workspace.analyses.get(selectedIndex).dataset);
      this.viewPropertyUpdater.update("datasetRootTreeModelNode", this.datasetRootTreeNode);
    }
    this.currentAnalysis = this.analysesDropdownModel.selectedItem;
    this.viewPropertyUpdater.update("currentAnalysis", this.currentAnalysis);
    if (this.currentAnalysis) {
      this.currentAnalysis.addEditEventListener(this.currentAnalysisEditListener);
      this.updateCancelEditsMenuItem();
      this.updateSaveAnalysisMenuItem();
      this.updateDeleteAnalysisMenuItem();
    }
  }

  closeCurrentAnalysis(): void {
    if (this.currentAnalysis.dirty) {
      this.viewPropertyUpdater.update('showAbandonEditsModal', true);
    } else {
      this.confirmCloseCurrentAnalysis();
    }
  }

  abandonEdits(confirm: boolean): void {
    if (confirm) {
      this.viewPropertyUpdater.update('showAbandonEditsModal', false);
      this.confirmCloseCurrentAnalysis();
    } else {
      this.viewPropertyUpdater.update('showAbandonEditsModal', false);
    }
  }

  confirmCloseCurrentAnalysis(): void {
    this.workspace.analyses.removeAt(this.analysesDropdownModel.selectedIndex.value);
  }

  deleteCurrentAnalysis(): void {
    this.viewPropertyUpdater.update('showDeleteConfirmationModal', true);
  }

  confirmDelete(confirm: boolean): void {
    if (confirm) {
      this.repository.deleteAnalysis(this.currentAnalysis);
      this.confirmCloseCurrentAnalysis();
      this.viewPropertyUpdater.update('showDeleteConfirmationModal', false);
    } else {
      this.viewPropertyUpdater.update('showDeleteConfirmationModal', false);
    }
  }

  cancelEdits(): void {
    this.currentAnalysis.cancelEdits();
  }

  newAnalysis(): void {
    this.viewPropertyUpdater.update('showNewAnalysisModal', true);
  }

  closeNewAnalysisModal(): void {
    this.viewPropertyUpdater.update('showNewAnalysisModal', false);
    this.datasetsDropdownModel.selectedIndex.value = null;
  }

  browseAnalyses(): void {
    this.repository.browseAnalyses().then(() => {
      this.viewPropertyUpdater.update('showBrowseAnalysisModal', true);
    });
  }

  closeBrowseAnalysisModal(): void {
    this.viewPropertyUpdater.update('showBrowseAnalysisModal', false);
  }

  browseAnalysesOpenSelection(browseAnalysesSelectedIndex: number): void {
    if (browseAnalysesSelectedIndex !== null) {
      this.workspace.analyses.add(this.browseAnalysesTableModel.getRowAt(browseAnalysesSelectedIndex).getItem());
      this.analysesDropdownModel.selectedIndex.value = this.workspace.analyses.length-1;
      this.closeBrowseAnalysisModal();
    }
  }

  chooseNewAnalysisDataset(): void {
    if (this.datasetsDropdownModel.selectedItem) {
      const currentAnalysisCount = this.workspace.analyses.length;
      this.workspace.analyses.add(new Analysis(this.datasetsDropdownModel.selectedItem, "Analysis " + (currentAnalysisCount+1)));
      this.closeNewAnalysisModal();
    }
  }

  saveCurrentAnalysis(): Promise<void> {
    return new Promise((resolve, _reject) => {
      if (this.currentAnalysis !== null) {
        this.repository.saveAnalysis(this.currentAnalysis).then((newId) => {
          if (this.currentAnalysis.id === undefined) {
            this.currentAnalysis.id = newId;
          }
          this.currentAnalysis.checkpointEdits();
        });
      }
      resolve();
    });
  }

  closeEditAnalysisMetadataModal(): void {
    this.viewPropertyUpdater.update('showAnalysisMetadataModal', false);
  }

  openEditAnalysisMetadataModal(): void {
    this.viewPropertyUpdater.update('showAnalysisMetadataModal', true);
  }

  confirmEditAnalysisMetadata(analysisTitle: string, analysisDescription: string): void {
    // todo: handle validation logic...Modal.svelte needs to be passed some kind of validation class...
    this.currentAnalysis.name = analysisTitle;
    if (!analysisDescription || !analysisDescription.trim().length) {
      this.currentAnalysis.description = null;
    } else {
      this.currentAnalysis.description = analysisDescription.trim();
    }
    this.closeEditAnalysisMetadataModal();
  }

}

class CurrentAnalysisEditListener implements EditEventListener {
  private controller: AnalysesController;
  private viewPropertyUpdater: ViewPropertyUpdater;
  constructor(controller: AnalysesController, viewPropertyUpdater: ViewPropertyUpdater) {
    this.controller = controller;
    this.viewPropertyUpdater = viewPropertyUpdater;
  }
  notifyEdit(_event: EditEvent): void {
    this.controller.updateCancelEditsMenuItem();
    this.controller.updateSaveAnalysisMenuItem();
    this.controller.updateDeleteAnalysisMenuItem();
  }
  notifyPropertyEdit(_event: PropertyEditEvent): void {
    this.viewPropertyUpdater.update("currentAnalysis", this.controller.currentAnalysis);
  }
}

interface ViewPropertyUpdater {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  update(field: string, value: any): void;
}
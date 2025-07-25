import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription, tap } from 'rxjs';

import { MaterialModule } from '../../modules/material.module';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { SelectedItemsComponent } from './components/selected-items/selected-items.component';
import { SAMPLE_TREE_DATA } from './data/sample-tree-data';
import { CheckboxState } from './models/checkbox-state.model';
import { CheckboxTreeSavedState } from './models/checkbox-tree-saved-state.model';
import { TreeNode } from './models/tree-node.model';
import { CheckboxTreePersistenceService } from './services/checkbox-tree-persistence.service';
import { CheckboxTreeStore } from './store/checkbox-tree.store';

@Component({
  selector: 'app-checkbox-tree',
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    SearchFilterComponent,
    SelectedItemsComponent,
  ],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
  providers: [CheckboxTreeStore],
})
export class CheckboxTreeComponent implements OnInit, OnDestroy {
  @Input() treeData: TreeNode[] = SAMPLE_TREE_DATA;
  @Input() maxChildHeight: string = '300px';
  @Input() showSearchFilter: boolean = true;
  @Input() baseNodePaddingPxl: number = 10;
  @Input() indentionStep: number = 20;
  @Input() initialState: CheckboxTreeSavedState | null = null;

  @Output() selectionChange = new EventEmitter<string[]>();

  selectedNodes$!: Observable<string[]>;

  expandedNodes = new Set<string>();
  currentTreeData: TreeNode[] = [];

  private subs = new Subscription();

  constructor(
    public store: CheckboxTreeStore,
    private persistenceService: CheckboxTreePersistenceService,
  ) {}

  ngOnInit(): void {
    this.store.initializeWithSavedState({
      treeData: this.treeData,
      savedSelections: this.initialState?.selectedNodeIds || [],
    });

    this.selectedNodes$ = this.store.selectedNodeNames$.pipe(
      tap((selectedNodes) => {
        this.selectionChange.emit(selectedNodes);
      }),
    );

    this.subs.add(
      this.store.expandedNodes$.subscribe((expandedNodes: Set<string>) => {
        this.expandedNodes = expandedNodes;
      }),
    );

    this.subs.add(
      this.store.currentTreeData$.subscribe((currentTreeData: TreeNode[]) => {
        this.currentTreeData = currentTreeData;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  hasChild(node: TreeNode): boolean {
    return !!(node.children && node.children.length > 0);
  }

  getChildNodes(parentNode: TreeNode): TreeNode[] {
    if (!parentNode.children) {
      return [];
    }

    const parentLevel = parentNode.level ?? 0;
    return parentNode.children.map((child) =>
      this.createTreeNodeWithProperties(child, parentLevel + 1),
    );
  }

  getTopLevelNodes(): TreeNode[] {
    return this.currentTreeData.map((node) =>
      this.createTreeNodeWithProperties(node, 0),
    );
  }

  isExpanded(node: TreeNode): boolean {
    return this.expandedNodes.has(node.id);
  }

  toggleExpansion(node: TreeNode): void {
    this.store.toggleNodeExpansion(node.id);
  }

  getCheckboxState(node: TreeNode): CheckboxState {
    return this.store.getCheckboxState(node.id);
  }

  toggleNodeSelection(node: TreeNode): void {
    this.store.toggleNodeSelection(node.id);
  }

  clearAllSelections(): void {
    this.store.clearAllSelections();
  }

  clearSavedState(): void {
    this.subs.add(this.persistenceService.clearSavedState().subscribe());
  }

  saveCurrentState(): void {
    this.subs.add(
      this.selectedNodes$.subscribe((selectedNodes) => {
        this.persistenceService.saveSelectedNodes(selectedNodes);
      }),
    );
  }

  getNodePadding(node: TreeNode): string {
    const level = node.level ?? 0;
    const indentLevel = level - 1;
    return `${indentLevel * this.indentionStep + this.baseNodePaddingPxl}px`;
  }

  trackByNodeId(_: number, node: TreeNode): string {
    return node.id;
  }

  private createTreeNodeWithProperties(
    node: TreeNode,
    level: number,
  ): TreeNode {
    const hasChildren = node.children && node.children.length > 0;

    return {
      ...node,
      level,
      expandable: hasChildren,
      isExpanded: this.expandedNodes.has(node.id),
      isVisible: true,
    };
  }
}

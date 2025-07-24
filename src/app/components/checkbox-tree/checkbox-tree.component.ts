import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { MaterialModule } from '../../modules/material.module';
import { SAMPLE_TREE_DATA } from './data/sample-tree-data';
import { CheckboxState, TreeNode } from './models/tree-node.interface';
import { CheckboxTreePersistenceService } from './services/checkbox-tree-persistence.service';
import { CheckboxTreeStore } from './store/checkbox-tree.store';

@Component({
  selector: 'app-checkbox-tree',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
  providers: [CheckboxTreeStore],
})
export class CheckboxTreeComponent implements OnInit, OnDestroy {
  @Input() treeData: TreeNode[] = SAMPLE_TREE_DATA;
  @Input() maxChildHeight: string = '300px';
  @Input() showSelectedItems: boolean = true;
  @Input() showSearchFilter: boolean = true;
  @Output() selectionChange = new EventEmitter<string[]>();

  searchControl = new FormControl('');
  selectedNodes: string[] = [];
  flattenedNodes: TreeNode[] = [];
  filteredNodes: TreeNode[] = [];
  expandedNodes = new Set<string>();
  originalExpandedNodes = new Set<string>(); // Store original expansion state
  currentTreeData: TreeNode[] = []; // Current tree data (filtered or original)

  private destroy$ = new Subject<void>();

  constructor(
    private store: CheckboxTreeStore,
    private persistenceService: CheckboxTreePersistenceService,
  ) {}

  ngOnInit(): void {
    // Load saved state first, then initialize
    this.persistenceService
      .loadSelectedNodes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((savedState) => {
        const savedSelections = savedState?.selectedNodeIds || [];

        // Initialize the store with tree data and saved selections
        this.store.initializeWithSavedState({
          treeData: this.treeData,
          savedSelections,
        });
      });

    // Subscribe to store state
    this.store.selectedNodeNames$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedNodeNames: string[]) => {
        this.selectedNodes = selectedNodeNames;
      });

    this.store.selectedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedNodes: Set<string>) => {
        const selectedArray = Array.from(selectedNodes);
        this.selectionChange.emit(selectedArray);

        // Auto-save selections when they change (with debounce)
        this.persistenceService
          .saveSelectedNodes(selectedArray)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      });

    this.store.flattenedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((flattenedNodes: TreeNode[]) => {
        this.flattenedNodes = flattenedNodes;
        this.filteredNodes = flattenedNodes;
      });

    this.store.expandedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((expandedNodes: Set<string>) => {
        this.expandedNodes = expandedNodes;
      });

    this.store.currentTreeData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentTreeData: TreeNode[]) => {
        this.currentTreeData = currentTreeData;
      });

    this.store.originalExpandedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((originalExpandedNodes: Set<string>) => {
        this.originalExpandedNodes = originalExpandedNodes;
      });

    // Subscribe to search input changes
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.store.setSearchTerm(searchTerm || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Flatten tree structure into a flat array with level information
   */
  private flattenTree(nodes: TreeNode[], level: number = 0): TreeNode[] {
    const flattened: TreeNode[] = [];

    nodes.forEach((node) => {
      const flatNode: TreeNode = {
        ...node,
        level,
        expandable: !!(node.children && node.children.length > 0),
        isExpanded: this.expandedNodes.has(node.id),
        isVisible: true,
      };
      flattened.push(flatNode);

      if (node.children && this.expandedNodes.has(node.id)) {
        flattened.push(...this.flattenTree(node.children, level + 1));
      }
    });

    return flattened;
  }

  /**
   * Check if node has children
   */
  hasChild(node: TreeNode): boolean {
    return !!(node.children && node.children.length > 0);
  }

  /**
   * Get child nodes for a given parent node from the original tree data
   */
  getChildNodes(parentNode: TreeNode): TreeNode[] {
    if (!parentNode.children) {
      return [];
    }

    // Return the children from the original tree data, mapped with flattened properties
    return parentNode.children.map((child) => ({
      ...child,
      level: (parentNode.level || 0) + 1,
      expandable: !!(child.children && child.children.length > 0),
      isExpanded: this.expandedNodes.has(child.id),
      isVisible: true,
    }));
  }

  /**
   * Get only top-level nodes from current tree data
   */
  getTopLevelNodes(): TreeNode[] {
    return this.currentTreeData.map((node) => ({
      ...node,
      level: 0,
      expandable: !!(node.children && node.children.length > 0),
      isExpanded: this.expandedNodes.has(node.id),
      isVisible: true,
    }));
  }

  /**
   * Check if node is expanded
   */
  isExpanded(node: TreeNode): boolean {
    return this.expandedNodes.has(node.id);
  }

  /**
   * Toggle node expansion
   */
  toggleExpansion(node: TreeNode): void {
    this.store.toggleNodeExpansion(node.id);
  }

  /**
   * Refresh the tree display
   */
  private refreshTree(): void {
    // This is now handled by the store
  }

  /**
   * Get checkbox state for a node
   */
  getCheckboxState(node: TreeNode): CheckboxState {
    return this.store.getCurrentCheckboxState(node.id);
  }

  /**
   * Toggle node selection
   */
  toggleNodeSelection(node: TreeNode): void {
    this.store.toggleNodeSelection(node.id);
  }

  /**
   * Clear search filter
   */
  clearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Clear all selections
   */
  clearAllSelections(): void {
    this.store.clearAllSelections();
  }

  /**
   * Clear saved state (for testing purposes)
   */
  clearSavedState(): void {
    this.persistenceService
      .clearSavedState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('💾 Saved state cleared successfully');
      });
  }

  /**
   * Manually save current state (for testing purposes)
   */
  saveCurrentState(): void {
    this.store.selectedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedNodes) => {
        const selectedArray = Array.from(selectedNodes);
        this.persistenceService
          .saveSelectedNodes(selectedArray)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            console.log('💾 Current state saved manually');
          });
      });
  }

  /**
   * Get selected count
   */
  getSelectedCount(): number {
    return this.selectedNodes.length;
  }

  /**
   * Get node padding based on level
   */
  getNodePadding(node: TreeNode): string {
    const level = node.level || 0;

    // Top-level nodes (level 0) get minimal padding
    if (level === 0) {
      return '10px';
    }

    // First child level (level 1) gets base padding since they're in a scroll container
    if (level === 1) {
      return '10px';
    }

    // Deeper levels (2+) get progressive indentation within the scroll container
    // Subtract 1 from level since level 1 is the base level in the scroll container
    const indentLevel = level - 1;
    return `${indentLevel * 20 + 10}px`;
  }

  /**
   * Track function for ngFor
   */
  trackByNodeId(index: number, node: TreeNode): string {
    return node.id;
  }

  /**
   * Track function for selected items
   */
  trackBySelectedItem(index: number, item: string): string {
    return item;
  }
}

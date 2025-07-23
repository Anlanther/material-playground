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
import { CheckboxTreeService } from './services/checkbox-tree.service';

@Component({
  selector: 'app-checkbox-tree',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
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

  private destroy$ = new Subject<void>();

  constructor(private checkboxTreeService: CheckboxTreeService) {}

  ngOnInit(): void {
    // Initialize tree data
    this.flattenedNodes = this.flattenTree(this.treeData);
    this.filteredNodes = [...this.flattenedNodes];

    // Subscribe to selection changes
    this.checkboxTreeService.selectedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedNodes) => {
        this.selectedNodes = this.checkboxTreeService.getSelectedNodeNames();
        this.selectionChange.emit(Array.from(selectedNodes));
      });

    // Subscribe to search input changes
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.filterTree(searchTerm || '');
      });

    // Initialize the service with the tree data
    this.initializeServiceData(this.treeData);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize service data by converting tree to flat structure for selection tracking
   */
  private initializeServiceData(treeData: TreeNode[]): void {
    this.checkboxTreeService.transformToFlatTree(treeData);
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
   * Filter tree based on search term
   */
  private filterTree(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // Show all data
      this.filteredNodes = [...this.flattenedNodes];
      return;
    }

    // Filter and show matching nodes with their parents
    const filteredData = this.filterTreeData(
      this.treeData,
      searchTerm.toLowerCase(),
    );
    this.filteredNodes = this.flattenTree(filteredData);

    // Expand all nodes when searching
    filteredData.forEach((node) => this.expandAllInBranch(node));
    this.filteredNodes = this.flattenTree(filteredData);
  }

  /**
   * Expand all nodes in a branch
   */
  private expandAllInBranch(node: TreeNode): void {
    if (node.children && node.children.length > 0) {
      this.expandedNodes.add(node.id);
      node.children.forEach((child) => this.expandAllInBranch(child));
    }
  }

  /**
   * Recursively filter tree data
   */
  private filterTreeData(nodes: TreeNode[], searchTerm: string): TreeNode[] {
    return nodes.filter((node) => {
      const matchesName = node.name.toLowerCase().includes(searchTerm);
      const hasMatchingChildren = node.children
        ? this.filterTreeData(node.children, searchTerm).length > 0
        : false;

      if (matchesName || hasMatchingChildren) {
        if (node.children && hasMatchingChildren) {
          // Return node with filtered children
          return {
            ...node,
            children: this.filterTreeData(node.children, searchTerm),
          };
        }
        return node;
      }
      return false;
    }) as TreeNode[];
  }

  /**
   * Check if node has children
   */
  hasChild(node: TreeNode): boolean {
    return !!(node.children && node.children.length > 0);
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
    if (this.expandedNodes.has(node.id)) {
      this.expandedNodes.delete(node.id);
    } else {
      this.expandedNodes.add(node.id);
    }

    // Refresh the tree
    this.refreshTree();
  }

  /**
   * Refresh the tree display
   */
  private refreshTree(): void {
    this.flattenedNodes = this.flattenTree(this.treeData);
    if (this.searchControl.value) {
      this.filterTree(this.searchControl.value);
    } else {
      this.filteredNodes = [...this.flattenedNodes];
    }
  }

  /**
   * Get checkbox state for a node
   */
  getCheckboxState(node: TreeNode): CheckboxState {
    return this.checkboxTreeService.getCheckboxState(node.id);
  }

  /**
   * Toggle node selection
   */
  toggleNodeSelection(node: TreeNode): void {
    this.checkboxTreeService.toggleNode(node.id);
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
    this.checkboxTreeService.clearAllSelections();
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
    return `${level * 20 + 10}px`;
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

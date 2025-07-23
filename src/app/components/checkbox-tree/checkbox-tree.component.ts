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
  originalExpandedNodes = new Set<string>(); // Store original expansion state
  currentTreeData: TreeNode[] = []; // Current tree data (filtered or original)

  private destroy$ = new Subject<void>();
  constructor(private checkboxTreeService: CheckboxTreeService) {}

  ngOnInit(): void {
    // Initialize tree data
    this.currentTreeData = this.treeData;
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
      // Restore original expansion state and show all data
      this.expandedNodes = new Set(this.originalExpandedNodes);
      this.currentTreeData = this.treeData;
      this.refreshTree();
      return;
    }

    // Store current expansion state if we're starting a new search
    if (
      !this.searchControl.value ||
      this.searchControl.value.length <= searchTerm.length
    ) {
      this.originalExpandedNodes = new Set(this.expandedNodes);
    }

    // Clear expansion for search
    this.expandedNodes.clear();

    // Filter and show matching nodes with their parents
    this.currentTreeData = this.filterTreeData(
      this.treeData,
      searchTerm.toLowerCase(),
    );

    // Only expand nodes that have matching children or are matches themselves
    this.autoExpandForSearch(this.currentTreeData, searchTerm.toLowerCase());

    // Flatten the filtered data
    this.filteredNodes = this.flattenTree(this.currentTreeData);
  }

  /**
   * Auto-expand only nodes that contain matches or have matching children
   */
  private autoExpandForSearch(nodes: TreeNode[], searchTerm: string): void {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        // Check if this node or any of its children match
        const hasMatchingDescendants = this.hasMatchingDescendants(
          node,
          searchTerm,
        );

        if (hasMatchingDescendants) {
          this.expandedNodes.add(node.id);
          this.autoExpandForSearch(node.children, searchTerm);
        }
      }
    });
  }

  /**
   * Check if a node has any descendants that match the search term
   */
  private hasMatchingDescendants(node: TreeNode, searchTerm: string): boolean {
    if (node.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    if (node.children) {
      return node.children.some((child) =>
        this.hasMatchingDescendants(child, searchTerm),
      );
    }

    return false;
  }

  /**
   * Recursively filter tree data to only include matching nodes and their parents
   */
  private filterTreeData(nodes: TreeNode[], searchTerm: string): TreeNode[] {
    return nodes.reduce((filtered: TreeNode[], node: TreeNode) => {
      // Check if current node matches the search term
      const isMatch = node.name.toLowerCase().includes(searchTerm);

      // Check if any children match (recursively)
      const filteredChildren = node.children
        ? this.filterTreeData(node.children, searchTerm)
        : [];

      // Include node if it matches or has matching children
      if (isMatch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren,
        });
      }

      return filtered;
    }, []);
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
    this.flattenedNodes = this.flattenTree(this.currentTreeData);
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

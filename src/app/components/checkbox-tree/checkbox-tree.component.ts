import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MaterialModule } from '../../modules/material.module';
import { TreeNode, FlatTreeNode, CheckboxState } from './models/tree-node.interface';
import { CheckboxTreeService } from './services/checkbox-tree.service';
import { SAMPLE_TREE_DATA } from './data/sample-tree-data';

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
  
  private destroy$ = new Subject<void>();
  
  // Tree control and data source
  treeControl = new FlatTreeControl<FlatTreeNode>(
    node => node.level,
    node => node.expandable
  );
  
  private treeFlattener = new MatTreeFlattener(
    // Transform function: converts TreeNode to FlatTreeNode
    (node: TreeNode, level: number): FlatTreeNode => ({
      id: node.id,
      name: node.name,
      level: level,
      expandable: !!(node.children && node.children.length > 0),
      isExpanded: false,
      isVisible: true,
      hasChildren: !!(node.children && node.children.length > 0)
    }),
    // Get level function: for FlatTreeNode
    (node: FlatTreeNode) => node.level,
    // Is expandable function: for FlatTreeNode
    (node: FlatTreeNode) => node.expandable,
    // Get children function: for TreeNode
    (node: TreeNode) => node.children || []
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private checkboxTreeService: CheckboxTreeService) {}

  ngOnInit(): void {
    // Initialize tree data
    this.dataSource.data = this.treeData;
    
    // Subscribe to selection changes
    this.checkboxTreeService.selectedNodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedNodes => {
        this.selectedNodes = this.checkboxTreeService.getSelectedNodeNames();
        this.selectionChange.emit(Array.from(selectedNodes));
      });

    // Subscribe to search input changes
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterTree(searchTerm || '');
      });

    // Initialize the service with the tree data
    this.checkboxTreeService.transformToFlatTree(this.treeData);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the tree with provided data
   */
  private initializeTree(): void {
    this.dataSource.data = this.treeData;
    this.checkboxTreeService.transformToFlatTree(this.treeData);
  }

  /**
   * Filter tree based on search term
   */
  private filterTree(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // Show all data
      this.dataSource.data = this.treeData;
      return;
    }

    // Filter the tree data
    const filteredData = this.filterTreeData(this.treeData, searchTerm.toLowerCase());
    this.dataSource.data = filteredData;
    
    // Expand all nodes when searching
    this.treeControl.expandAll();
  }

  /**
   * Recursively filter tree data
   */
  private filterTreeData(nodes: TreeNode[], searchTerm: string): TreeNode[] {
    return nodes.filter(node => {
      const matchesName = node.name.toLowerCase().includes(searchTerm);
      const hasMatchingChildren = node.children ? 
        this.filterTreeData(node.children, searchTerm).length > 0 : false;

      if (matchesName || hasMatchingChildren) {
        if (node.children && hasMatchingChildren) {
          // Return node with filtered children
          return {
            ...node,
            children: this.filterTreeData(node.children, searchTerm)
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
  hasChild = (_: number, node: FlatTreeNode): boolean => {
    return node.expandable;
  };

  /**
   * Get checkbox state for a node
   */
  getCheckboxState(node: FlatTreeNode): CheckboxState {
    return this.checkboxTreeService.getCheckboxState(node.id);
  }

  /**
   * Toggle node selection
   */
  toggleNodeSelection(node: FlatTreeNode): void {
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
  getNodePadding(level: number): string {
    return `${level * 20 + 10}px`;
  }

  /**
   * Track function for ngFor
   */
  trackByNodeId(index: number, node: FlatTreeNode): string {
    return node.id;
  }

  /**
   * Track function for selected items
   */
  trackBySelectedItem(index: number, item: string): string {
    return item;
  }
}

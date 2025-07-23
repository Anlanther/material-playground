import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TreeNode, FlatTreeNode, CheckboxState } from '../models/tree-node.interface';

@Injectable({
  providedIn: 'root'
})
export class CheckboxTreeService {
  private selectedNodesSubject = new BehaviorSubject<Set<string>>(new Set());
  public selectedNodes$ = this.selectedNodesSubject.asObservable();

  private dataSourceSubject = new BehaviorSubject<FlatTreeNode[]>([]);
  public dataSource$ = this.dataSourceSubject.asObservable();

  private originalData: TreeNode[] = [];
  private flatNodeMap = new Map<string, FlatTreeNode>();

  constructor() {}

  /**
   * Transform hierarchical tree data into flat tree structure
   */
  transformToFlatTree(data: TreeNode[]): FlatTreeNode[] {
    this.originalData = data;
    const flatData: FlatTreeNode[] = [];
    this.flatNodeMap.clear();

    const flatten = (nodes: TreeNode[], level: number = 0, parent?: FlatTreeNode): void => {
      nodes.forEach(node => {
        const flatNode: FlatTreeNode = {
          id: node.id,
          name: node.name,
          level,
          expandable: !!(node.children && node.children.length > 0),
          isExpanded: false,
          isVisible: true,
          hasChildren: !!(node.children && node.children.length > 0),
          parent
        };

        this.flatNodeMap.set(node.id, flatNode);
        flatData.push(flatNode);

        if (node.children && node.children.length > 0) {
          flatten(node.children, level + 1, flatNode);
        }
      });
    };

    flatten(data);
    this.dataSourceSubject.next(flatData);
    return flatData;
  }

  /**
   * Get checkbox state for a node
   */
  getCheckboxState(nodeId: string): CheckboxState {
    const selectedNodes = this.selectedNodesSubject.value;
    const node = this.flatNodeMap.get(nodeId);
    
    if (!node) {
      return { checked: false, indeterminate: false };
    }

    const isChecked = selectedNodes.has(nodeId);
    const descendants = this.getDescendants(nodeId);
    const checkedDescendants = descendants.filter(d => selectedNodes.has(d.id));
    
    if (!node.hasChildren) {
      return { checked: isChecked, indeterminate: false };
    }

    const allDescendantsChecked = descendants.length > 0 && checkedDescendants.length === descendants.length;
    const someDescendantsChecked = checkedDescendants.length > 0;

    return {
      checked: allDescendantsChecked,
      indeterminate: someDescendantsChecked && !allDescendantsChecked
    };
  }

  /**
   * Toggle node selection with parent-child logic
   */
  toggleNode(nodeId: string): void {
    const selectedNodes = new Set(this.selectedNodesSubject.value);
    const node = this.flatNodeMap.get(nodeId);
    
    if (!node) return;

    const currentState = this.getCheckboxState(nodeId);
    const shouldCheck = !currentState.checked;

    if (shouldCheck) {
      selectedNodes.add(nodeId);
      // Select all descendants
      this.getDescendants(nodeId).forEach(descendant => {
        selectedNodes.add(descendant.id);
      });
    } else {
      selectedNodes.delete(nodeId);
      // Deselect all descendants
      this.getDescendants(nodeId).forEach(descendant => {
        selectedNodes.delete(descendant.id);
      });
    }

    // Update parent states
    this.updateParentStates(nodeId, selectedNodes);
    
    this.selectedNodesSubject.next(selectedNodes);
  }

  /**
   * Get all descendants of a node
   */
  private getDescendants(nodeId: string): FlatTreeNode[] {
    const node = this.flatNodeMap.get(nodeId);
    if (!node) return [];

    const descendants: FlatTreeNode[] = [];
    const allNodes = this.dataSourceSubject.value;
    const nodeIndex = allNodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex === -1) return [];

    for (let i = nodeIndex + 1; i < allNodes.length; i++) {
      const currentNode = allNodes[i];
      if (currentNode.level <= node.level) break;
      descendants.push(currentNode);
    }

    return descendants;
  }

  /**
   * Get all ancestors of a node
   */
  private getAncestors(nodeId: string): FlatTreeNode[] {
    const node = this.flatNodeMap.get(nodeId);
    if (!node) return [];

    const ancestors: FlatTreeNode[] = [];
    let current = node.parent;
    
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }

    return ancestors;
  }

  /**
   * Update parent checkbox states based on children
   */
  private updateParentStates(nodeId: string, selectedNodes: Set<string>): void {
    const ancestors = this.getAncestors(nodeId);
    
    ancestors.forEach(ancestor => {
      const siblings = this.getDirectChildren(ancestor.id);
      const checkedSiblings = siblings.filter(sibling => 
        this.isNodeOrAllDescendantsSelected(sibling.id, selectedNodes)
      );

      if (checkedSiblings.length === siblings.length && siblings.length > 0) {
        selectedNodes.add(ancestor.id);
      } else {
        selectedNodes.delete(ancestor.id);
      }
    });
  }

  /**
   * Get direct children of a node
   */
  private getDirectChildren(nodeId: string): FlatTreeNode[] {
    const node = this.flatNodeMap.get(nodeId);
    if (!node) return [];

    const allNodes = this.dataSourceSubject.value;
    const nodeIndex = allNodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex === -1) return [];

    const children: FlatTreeNode[] = [];
    for (let i = nodeIndex + 1; i < allNodes.length; i++) {
      const currentNode = allNodes[i];
      if (currentNode.level <= node.level) break;
      if (currentNode.level === node.level + 1) {
        children.push(currentNode);
      }
    }

    return children;
  }

  /**
   * Check if a node or all its descendants are selected
   */
  private isNodeOrAllDescendantsSelected(nodeId: string, selectedNodes: Set<string>): boolean {
    const node = this.flatNodeMap.get(nodeId);
    if (!node) return false;

    if (!node.hasChildren) {
      return selectedNodes.has(nodeId);
    }

    const descendants = this.getDescendants(nodeId);
    const leafDescendants = descendants.filter(d => !d.hasChildren);
    
    return leafDescendants.length > 0 && 
           leafDescendants.every(leaf => selectedNodes.has(leaf.id));
  }

  /**
   * Filter tree based on search term
   */
  filterTree(searchTerm: string): void {
    const allNodes = this.dataSourceSubject.value;
    
    if (!searchTerm.trim()) {
      // Show all nodes
      allNodes.forEach(node => node.isVisible = true);
    } else {
      const searchLower = searchTerm.toLowerCase();
      
      // First, mark all nodes as invisible
      allNodes.forEach(node => node.isVisible = false);
      
      // Find matching nodes
      const matchingNodes = allNodes.filter(node => 
        node.name.toLowerCase().includes(searchLower)
      );
      
      // Make matching nodes and their ancestors visible
      matchingNodes.forEach(node => {
        node.isVisible = true;
        this.makeAncestorsVisible(node.id, allNodes);
      });
    }
    
    this.dataSourceSubject.next([...allNodes]);
  }

  /**
   * Make all ancestors of a node visible
   */
  private makeAncestorsVisible(nodeId: string, allNodes: FlatTreeNode[]): void {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    let current = node.parent;
    while (current) {
      current.isVisible = true;
      current = current.parent;
    }
  }

  /**
   * Toggle node expansion
   */
  toggleExpansion(nodeId: string): void {
    const node = this.flatNodeMap.get(nodeId);
    if (node && node.expandable) {
      node.isExpanded = !node.isExpanded;
      this.dataSourceSubject.next([...this.dataSourceSubject.value]);
    }
  }

  /**
   * Get selected node names for display
   */
  getSelectedNodeNames(): string[] {
    const selectedNodes = this.selectedNodesSubject.value;
    const allNodes = this.dataSourceSubject.value;
    
    return allNodes
      .filter(node => selectedNodes.has(node.id))
      .map(node => node.name)
      .sort();
  }

  /**
   * Clear all selections
   */
  clearAllSelections(): void {
    this.selectedNodesSubject.next(new Set());
  }

  /**
   * Get selected node IDs
   */
  getSelectedNodeIds(): string[] {
    return Array.from(this.selectedNodesSubject.value);
  }
}

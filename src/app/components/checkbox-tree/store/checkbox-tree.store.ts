import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CheckboxState, TreeNode } from '../models/tree-node.interface';

export interface CheckboxTreeState {
  treeData: TreeNode[];
  selectedNodes: Set<string>;
  expandedNodes: Set<string>;
  searchTerm: string;
  originalExpandedNodes: Set<string>;
  currentTreeData: TreeNode[];
  isInitialized: boolean;
}

const initialState: CheckboxTreeState = {
  treeData: [],
  selectedNodes: new Set<string>(),
  expandedNodes: new Set<string>(),
  searchTerm: '',
  originalExpandedNodes: new Set<string>(),
  currentTreeData: [],
  isInitialized: false,
};

@Injectable()
export class CheckboxTreeStore extends ComponentStore<CheckboxTreeState> {
  constructor() {
    super(initialState);
  }

  // Selectors
  readonly treeData$ = this.select((state) => state.treeData);
  readonly selectedNodes$ = this.select((state) => state.selectedNodes);
  readonly expandedNodes$ = this.select((state) => state.expandedNodes);
  readonly searchTerm$ = this.select((state) => state.searchTerm);
  readonly currentTreeData$ = this.select((state) => state.currentTreeData);
  readonly originalExpandedNodes$ = this.select(
    (state) => state.originalExpandedNodes,
  );
  readonly isInitialized$ = this.select((state) => state.isInitialized);

  readonly selectedNodeNames$ = this.select(
    this.selectedNodes$,
    this.treeData$,
    (selectedNodes, treeData) => {
      const nodeMap = this.createNodeMap(treeData);
      return Array.from(selectedNodes)
        .map((id) => nodeMap.get(id)?.name)
        .filter((name): name is string => !!name);
    },
  );

  readonly selectedCount$ = this.select(
    this.selectedNodes$,
    (selectedNodes) => selectedNodes.size,
  );

  // Updaters
  readonly setTreeData = this.updater((state, treeData: TreeNode[]) => ({
    ...state,
    treeData,
    currentTreeData: treeData,
  }));

  readonly setSelectedNodes = this.updater(
    (state, selectedNodes: Set<string>) => ({
      ...state,
      selectedNodes: new Set(selectedNodes),
    }),
  );

  readonly setExpandedNodes = this.updater(
    (state, expandedNodes: Set<string>) => ({
      ...state,
      expandedNodes: new Set(expandedNodes),
    }),
  );

  readonly toggleNodeExpansion = this.updater((state, nodeId: string) => {
    const newExpandedNodes = new Set(state.expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }

    return {
      ...state,
      expandedNodes: newExpandedNodes,
    };
  });

  readonly toggleNodeSelection = this.updater((state, nodeId: string) => {
    const newSelectedNodes = new Set(state.selectedNodes);
    const nodeMap = this.createNodeMap(state.treeData);

    // Toggle the current node
    if (newSelectedNodes.has(nodeId)) {
      newSelectedNodes.delete(nodeId);
    } else {
      newSelectedNodes.add(nodeId);
    }

    // Handle parent-child relationships
    this.updateParentChildSelections(nodeId, newSelectedNodes, nodeMap);

    return {
      ...state,
      selectedNodes: newSelectedNodes,
    };
  });

  readonly setSearchTerm = this.updater((state, searchTerm: string) => {
    let newExpandedNodes = state.expandedNodes;
    let newCurrentTreeData = state.currentTreeData;
    let newOriginalExpandedNodes = state.originalExpandedNodes;

    if (!searchTerm.trim()) {
      // Restore original expansion state and show all data
      newExpandedNodes = new Set(state.originalExpandedNodes);
      newCurrentTreeData = state.treeData;
    } else {
      // Store current expansion state if we're starting a new search
      if (!state.searchTerm || state.searchTerm.length <= searchTerm.length) {
        newOriginalExpandedNodes = new Set(state.expandedNodes);
      }

      // Filter and show matching nodes with their parents
      newCurrentTreeData = this.filterTreeData(
        state.treeData,
        searchTerm.toLowerCase(),
      );

      // Auto-expand nodes that contain matches
      newExpandedNodes = new Set<string>();
      this.autoExpandForSearch(
        newCurrentTreeData,
        searchTerm.toLowerCase(),
        newExpandedNodes,
      );
    }

    return {
      ...state,
      searchTerm,
      expandedNodes: newExpandedNodes,
      currentTreeData: newCurrentTreeData,
      originalExpandedNodes: newOriginalExpandedNodes,
    };
  });

  readonly clearAllSelections = this.updater((state) => ({
    ...state,
    selectedNodes: new Set<string>(),
  }));

  readonly setInitialized = this.updater((state, isInitialized: boolean) => ({
    ...state,
    isInitialized,
  }));

  // Effects
  readonly initializeWithSavedState = this.effect(
    (
      trigger$: Observable<{
        treeData: TreeNode[];
        savedSelections?: string[];
      }>,
    ) => {
      return trigger$.pipe(
        tap(({ treeData, savedSelections }) => {
          this.setTreeData(treeData);

          if (savedSelections && savedSelections.length > 0) {
            // When restoring saved state, keep tree collapsed
            this.setSelectedNodes(new Set(savedSelections));
            this.setExpandedNodes(new Set<string>()); // Keep collapsed
          }

          this.setInitialized(true);
        }),
      );
    },
  );

  // Helper methods
  private createNodeMap(treeData: TreeNode[]): Map<string, TreeNode> {
    const nodeMap = new Map<string, TreeNode>();

    const traverse = (nodes: TreeNode[], parent?: TreeNode) => {
      nodes.forEach((node) => {
        const nodeWithParent = { ...node, parent };
        nodeMap.set(node.id, nodeWithParent);
        if (node.children) {
          traverse(node.children, nodeWithParent);
        }
      });
    };

    traverse(treeData);
    return nodeMap;
  }

  private filterTreeData(nodes: TreeNode[], searchTerm: string): TreeNode[] {
    return nodes.reduce((filtered: TreeNode[], node: TreeNode) => {
      const isMatch = node.name.toLowerCase().includes(searchTerm);
      const filteredChildren = node.children
        ? this.filterTreeData(node.children, searchTerm)
        : [];

      if (isMatch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren,
        });
      }

      return filtered;
    }, []);
  }

  private autoExpandForSearch(
    nodes: TreeNode[],
    searchTerm: string,
    expandedNodes: Set<string>,
  ): void {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        const hasMatchingDescendants = this.hasMatchingDescendants(
          node,
          searchTerm,
        );

        if (hasMatchingDescendants) {
          expandedNodes.add(node.id);
          this.autoExpandForSearch(node.children, searchTerm, expandedNodes);
        }
      }
    });
  }

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

  private updateParentChildSelections(
    nodeId: string,
    selectedNodes: Set<string>,
    nodeMap: Map<string, TreeNode>,
  ): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    // Update children
    if (node.children) {
      const isSelected = selectedNodes.has(nodeId);
      this.updateChildrenSelection(node.children, isSelected, selectedNodes);
    }

    // Update parents
    this.updateParentSelection(node, selectedNodes, nodeMap);
  }

  private updateChildrenSelection(
    children: TreeNode[],
    isSelected: boolean,
    selectedNodes: Set<string>,
  ): void {
    children.forEach((child) => {
      if (isSelected) {
        selectedNodes.add(child.id);
      } else {
        selectedNodes.delete(child.id);
      }

      if (child.children) {
        this.updateChildrenSelection(child.children, isSelected, selectedNodes);
      }
    });
  }

  private updateParentSelection(
    node: TreeNode,
    selectedNodes: Set<string>,
    nodeMap: Map<string, TreeNode>,
  ): void {
    if (!node.parent) return;

    const parent = nodeMap.get(node.parent.id);
    if (!parent || !parent.children) return;

    const selectedChildrenCount = parent.children.filter((child) =>
      selectedNodes.has(child.id),
    ).length;

    if (selectedChildrenCount === parent.children.length) {
      selectedNodes.add(parent.id);
    } else {
      selectedNodes.delete(parent.id);
    }

    // Recursively update parent's parent
    this.updateParentSelection(parent, selectedNodes, nodeMap);
  }

  getCheckboxState(nodeId: string): CheckboxState {
    const state = this.get();
    const nodeMap = this.createNodeMap(state.treeData);
    const node = nodeMap.get(nodeId);

    if (!node) {
      return { checked: false, indeterminate: false };
    }

    const isSelected = state.selectedNodes.has(nodeId);

    if (!node.children || node.children.length === 0) {
      return { checked: isSelected, indeterminate: false };
    }

    const selectedChildrenCount = this.countSelectedChildren(
      node.children,
      state.selectedNodes,
    );
    const totalChildren = this.countTotalChildren(node.children);

    if (selectedChildrenCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedChildrenCount === totalChildren) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }

  private countSelectedChildren(
    children: TreeNode[],
    selectedNodes: Set<string>,
  ): number {
    return children.reduce((count, child) => {
      let childCount = selectedNodes.has(child.id) ? 1 : 0;
      if (child.children) {
        childCount += this.countSelectedChildren(child.children, selectedNodes);
      }
      return count + childCount;
    }, 0);
  }

  private countTotalChildren(children: TreeNode[]): number {
    return children.reduce((count, child) => {
      let childCount = 1;
      if (child.children) {
        childCount += this.countTotalChildren(child.children);
      }
      return count + childCount;
    }, 0);
  }
}

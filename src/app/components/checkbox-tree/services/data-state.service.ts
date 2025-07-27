import { Injectable } from '@angular/core';
import { DataSource, TreeNode } from '../models';
import { SelectedFilters } from '../models/selected-filter.model';

@Injectable({
  providedIn: 'root',
})
export class DataStateService {
  convertDataToTreeData(
    data: DataSource,
    level = 0,
    rootId?: string,
  ): TreeNode[] {
    const treeNodes: TreeNode[] = data.map((s) => {
      const currentRootId = rootId ?? s.id;
      const hasChildren = s.children && s.children.length > 0;

      const node: TreeNode = {
        id: s.id,
        name: s.name,
        level,
        rootId: currentRootId,
        isLeaf: !hasChildren,
        isExpanded: false,
        checkboxState: {
          checked: false,
          indeterminate: false,
        },
        children: hasChildren
          ? this.convertDataToTreeData(s.children!, level + 1, currentRootId)
          : [],
        selectedCount: 0,
        totalCount: 0,
      };
      return node;
    });

    return this.calculateNodeCounts(treeNodes);
  }

  convertToSelectedFilter(treeData: TreeNode[]): SelectedFilters {
    const result: SelectedFilters = {};

    const collectSelectedLeafNodes = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.isLeaf && node.checkboxState.checked) {
          if (!result[node.rootId]) {
            result[node.rootId] = [];
          }
          result[node.rootId].push(node.id);
        }
        if (node.children.length > 0) {
          collectSelectedLeafNodes(node.children);
        }
      }
    };

    collectSelectedLeafNodes(treeData);

    return result;
  }

  updateCheckboxStates(tree: TreeNode[], changedNodeId: string): TreeNode[] {
    let updatedTree = tree;

    const nodePath = this.findNodePath(tree, changedNodeId);
    const changedNode = nodePath[nodePath.length - 1];
    const newCheckedState = !changedNode.checkboxState.checked;

    updatedTree = this.updateNodeInTree(updatedTree, changedNodeId, (node) => ({
      ...node,
      checkboxState: {
        checked: newCheckedState,
        indeterminate: false,
      },
    }));

    updatedTree = this.updateNodeInTree(updatedTree, changedNodeId, (node) => ({
      ...node,
      children: this.updateChildrenCheckboxes(node.children, newCheckedState),
    }));

    for (let i = nodePath.length - 2; i >= 0; i--) {
      const ancestorNode = nodePath[i];
      updatedTree = this.updateNodeInTree(
        updatedTree,
        ancestorNode.id,
        (node) => ({
          ...node,
          checkboxState: this.calculateParentCheckboxState(node.children),
        }),
      );
    }

    return this.calculateNodeCounts(updatedTree);
  }

  updateNodeExpansion(tree: TreeNode[], nodeId: string): TreeNode[] {
    const nodePath = this.findNodePath(tree, nodeId);
    const targetNode = nodePath[nodePath.length - 1];

    if (targetNode.isLeaf) {
      return tree;
    }

    return this.updateNodeInTree(tree, nodeId, (node) => ({
      ...node,
      isExpanded: !node.isExpanded,
    }));
  }

  filterTreeData(nodes: TreeNode[], searchTerm: string): TreeNode[] {
    return nodes.reduce((filtered: TreeNode[], node: TreeNode) => {
      const isMatch = node.name.toLowerCase().includes(searchTerm);
      const filteredChildren = node.children
        ? this.filterTreeData(node.children, searchTerm)
        : [];

      if (isMatch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren,
          // Expand parent nodes that contain matches so they're visible
          isExpanded: filteredChildren.length > 0 ? true : node.isExpanded,
        });
      }

      return filtered;
    }, []);
  }

  private findNodePath(
    tree: TreeNode[],
    targetId: string,
    path: TreeNode[] = [],
  ): TreeNode[] {
    for (const node of tree) {
      const currentPath = [...path, node];
      const isTargetNode = node.id === targetId;
      const hasChildren = node.children.length > 0;
      if (isTargetNode) {
        return currentPath;
      }
      if (hasChildren) {
        try {
          const found = this.findNodePath(node.children, targetId, currentPath);
          return found;
        } catch (error) {
          // Continue searching in other branches if not found in this subtree
          continue;
        }
      }
    }

    throw Error(`Node with id ${targetId} not found`);
  }

  private updateNodeInTree(
    tree: TreeNode[],
    nodeId: string,
    updateFn: (node: TreeNode) => TreeNode,
  ): TreeNode[] {
    return tree.map((node) => {
      const isCurrentNode = node.id === nodeId;
      const hasChildren = !node.isLeaf && node.children.length > 0;
      if (isCurrentNode) {
        return updateFn(node);
      }

      if (hasChildren) {
        const updatedChildren = this.updateNodeInTree(
          node.children,
          nodeId,
          updateFn,
        );
        return { ...node, children: updatedChildren };
      }

      return node;
    });
  }

  private updateChildrenCheckboxes(
    children: TreeNode[],
    checked: boolean,
  ): TreeNode[] {
    return children.map((child) => ({
      ...child,
      checkboxState: { checked, indeterminate: false },
      children: child.isLeaf
        ? child.children
        : this.updateChildrenCheckboxes(child.children, checked),
    }));
  }

  private calculateParentCheckboxState(children: TreeNode[]): {
    checked: boolean;
    indeterminate: boolean;
  } {
    const hasNoChildren = children.length === 0;
    if (hasNoChildren) {
      return { checked: false, indeterminate: false };
    }

    const checkedCount = children.filter(
      (child) =>
        child.checkboxState.checked && !child.checkboxState.indeterminate,
    ).length;
    const indeterminateCount = children.filter(
      (child) => child.checkboxState.indeterminate,
    ).length;

    const hasNoChildrenSelected =
      checkedCount === 0 && indeterminateCount === 0;
    const hasAllChildrenSelected =
      checkedCount === children.length && indeterminateCount === 0;

    if (hasNoChildrenSelected) {
      return { checked: false, indeterminate: false };
    } else if (hasAllChildrenSelected) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }

  private calculateNodeCounts(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => {
      const updatedNode = { ...node };
      const hasChildren =
        updatedNode.children && updatedNode.children.length > 0;
      if (hasChildren) {
        // Recursively calculate counts for children first
        updatedNode.children = this.calculateNodeCounts(node.children);

        // Calculate counts for this node
        const { selectedCount, totalCount } = this.getNodeCounts(updatedNode);
        updatedNode.selectedCount = selectedCount;
        updatedNode.totalCount = totalCount;
      } else {
        // Leaf node counts
        updatedNode.selectedCount =
          updatedNode.checkboxState.checked &&
          !updatedNode.checkboxState.indeterminate
            ? 1
            : 0;
        updatedNode.totalCount = 1;
      }

      return updatedNode;
    });
  }

  private getNodeCounts(node: TreeNode): {
    selectedCount: number;
    totalCount: number;
  } {
    let selectedCount = 0;
    let totalCount = 1; // Count this node

    const isCheckedLeaf =
      node.isLeaf &&
      node.checkboxState.checked &&
      !node.checkboxState.indeterminate;
    if (isCheckedLeaf) {
      selectedCount += 1;
    }

    // Count children
    if (node.children) {
      for (const child of node.children) {
        selectedCount += child.selectedCount ?? 0;
        totalCount += child.totalCount ?? 0;
      }
    }

    return { selectedCount, totalCount };
  }
}

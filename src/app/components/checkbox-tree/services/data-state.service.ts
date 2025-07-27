import { Injectable } from '@angular/core';
import { DataSource, TreeNode } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DataStateService {
  convertDataToTreeData(data: DataSource, level = 0): TreeNode[] {
    const treeNodes: TreeNode[] = data.map((s) => {
      const node: TreeNode = {
        id: s.id,
        name: s.name,
        level,
        isExpanded: false,
        checkboxState: {
          checked: false,
          indeterminate: false,
        },
        children: this.convertDataToTreeData(s.children ?? [], level + 1),
      };

      return node;
    });
    return treeNodes;
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

    return updatedTree;
  }

  updateNodeExpansion(tree: TreeNode[], nodeId: string): TreeNode[] {
    return this.updateNodeInTree(tree, nodeId, (node) => ({
      ...node,
      isExpanded: !node.isExpanded,
    }));
  }

  // Helper methods
  private findNodePath(
    tree: TreeNode[],
    targetId: string,
    path: TreeNode[] = [],
  ): TreeNode[] {
    for (const node of tree) {
      const currentPath = [...path, node];
      if (node.id === targetId) {
        return currentPath;
      }
      if (node.children.length > 0) {
        const found = this.findNodePath(node.children, targetId, currentPath);
        if (found) return found;
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
      if (isCurrentNode) {
        return updateFn(node);
      }

      const hasChildren = node.children.length > 0;
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
      children: this.updateChildrenCheckboxes(child.children, checked),
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
}

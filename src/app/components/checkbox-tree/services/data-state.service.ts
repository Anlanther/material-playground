import { Injectable } from '@angular/core';
import { DataSource, TreeNode } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DataStateService {
  convertDataToTreeData(
    data: DataSource,
    parentNode?: TreeNode,
    level = 0,
  ): TreeNode[] {
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
        parentNode,
        children: [],
      };

      if (s.children) {
        node.children = this.convertDataToTreeData(s.children, node, level + 1);
      }

      return node;
    });
    return treeNodes;
  }

  updateParentChildCheckboxState(node: TreeNode): void {
    node.checkboxState = {
      checked: !node.checkboxState.checked,
      indeterminate: false,
    };

    this.updateDescendants(node, node.checkboxState.checked);
    this.updateAncestors(node);
  }

  private updateDescendants(node: TreeNode, checked: boolean): void {
    if (node.children.length > 0) {
      node.children.forEach((child) => {
        child.checkboxState = {
          checked,
          indeterminate: false,
        };
        this.updateDescendants(child, checked);
      });
    }
  }

  private updateAncestors(node: TreeNode): void {
    let currentParent = node.parentNode;
    while (currentParent) {
      this.updateParentState(currentParent);
      currentParent = currentParent.parentNode;
    }
  }

  private updateParentState(parent: TreeNode): void {
    if (!parent.children || parent.children.length === 0) {
      return;
    }

    const checkedChildren = parent.children.filter(
      (child) => child.checkboxState.checked,
    );
    const indeterminateChildren = parent.children.filter(
      (child) => child.checkboxState.indeterminate,
    );

    if (checkedChildren.length === parent.children.length) {
      parent.checkboxState = { checked: true, indeterminate: false };
    } else if (
      checkedChildren.length === 0 &&
      indeterminateChildren.length === 0
    ) {
      parent.checkboxState = { checked: false, indeterminate: false };
    } else {
      parent.checkboxState = { checked: false, indeterminate: true };
    }
  }
}

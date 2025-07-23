export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  parent?: TreeNode;
  level?: number;
  expandable?: boolean;
  isExpanded?: boolean;
  isVisible?: boolean;
}

export interface FlatTreeNode {
  id: string;
  name: string;
  level: number;
  expandable: boolean;
  isExpanded?: boolean;
  isVisible?: boolean;
  hasChildren?: boolean;
  parent?: FlatTreeNode;
}

export interface CheckboxState {
  checked: boolean;
  indeterminate: boolean;
}

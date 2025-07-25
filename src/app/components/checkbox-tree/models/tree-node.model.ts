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

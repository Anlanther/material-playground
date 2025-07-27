export interface TreeNode {
  id: string;
  name: string;
  level: number;
  rootId: string;
  isLeaf: boolean;
  isExpanded: boolean;
  checkboxState: {
    checked: boolean;
    indeterminate: boolean;
  };
  children: TreeNode[];
}

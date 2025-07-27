export interface TreeNode {
  id: string;
  name: string;
  level: number;
  isExpanded: boolean;
  checkboxState: {
    checked: boolean;
    indeterminate: boolean;
  };
  children: TreeNode[];
}

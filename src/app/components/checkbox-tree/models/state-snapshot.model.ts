import { TreeNode } from './tree-node.model';

export interface StateSnapshot {
  id: string;
  name: string;
  treeData: TreeNode[];
}

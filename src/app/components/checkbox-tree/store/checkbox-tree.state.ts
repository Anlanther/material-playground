import { CheckboxState } from '../models/checkbox-state.model';
import { TreeNode } from '../models/tree-node.model';

export interface CheckboxTreeState {
  treeData: TreeNode[];
  selectedNodes: Set<string>;
  expandedNodes: Set<string>;
  searchTerm: string;
  originalExpandedNodes: Set<string>;
  currentTreeData: TreeNode[];
  isInitialized: boolean;
  checkboxState: {
    [nodeId: string]: CheckboxState;
  };
}

export const initialState: CheckboxTreeState = {
  treeData: [],
  selectedNodes: new Set<string>(),
  expandedNodes: new Set<string>(),
  searchTerm: '',
  originalExpandedNodes: new Set<string>(),
  currentTreeData: [],
  isInitialized: false,
  checkboxState: {},
};

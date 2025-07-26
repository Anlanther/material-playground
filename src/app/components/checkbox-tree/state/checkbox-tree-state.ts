import { SavedStates, TreeNode } from '../models';

export interface CheckboxTreeState {
  originalTreeData: TreeNode[];
  treeData: TreeNode[];
  search: {
    query: string;
  };
  savedStates: SavedStates;
}

export const DEFAULT_STATE: CheckboxTreeState = {
  originalTreeData: [],
  treeData: [],
  search: {
    query: '',
  },
  savedStates: {
    selectedId: null,
    states: [],
  },
};

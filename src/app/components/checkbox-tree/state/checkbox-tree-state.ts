import { SavedSelectedState, TreeNode } from '../models';

export interface CheckboxTreeState {
  originalTreeData: TreeNode[];
  treeData: TreeNode[];
  search: {
    query: string;
  };
  savedStates: {
    selectedId: string | null;
    savedSelectedStates: SavedSelectedState[];
  };
}

export const DEFAULT_STATE: CheckboxTreeState = {
  originalTreeData: [],
  treeData: [],
  search: {
    query: '',
  },
  savedStates: {
    selectedId: null,
    savedSelectedStates: [],
  },
};

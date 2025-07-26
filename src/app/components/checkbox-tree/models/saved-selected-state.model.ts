import { SelectedNode } from './selected-node.model';

export interface SavedSelectedState {
  id: string;
  name: string;
  selectedNodes: SelectedNode[];
}

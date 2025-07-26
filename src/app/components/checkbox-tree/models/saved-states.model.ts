import { StateSnapshot } from './state-snapshot.model';

export interface SavedStates {
  selectedId: string | null;
  states: StateSnapshot[];
}

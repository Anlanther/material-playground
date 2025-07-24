import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface CheckboxTreeSavedState {
  selectedNodeIds: string[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CheckboxTreePersistenceService {
  private readonly STORAGE_KEY = 'checkbox-tree-state';

  /**
   * Save the selected node IDs to storage
   * @param selectedNodeIds Array of selected node IDs
   * @returns Observable that completes when save is done
   */
  saveSelectedNodes(selectedNodeIds: string[]): Observable<void> {
    console.log(
      '🔄 CheckboxTreePersistenceService: Saving selected nodes:',
      selectedNodeIds,
    );

    const state: CheckboxTreeSavedState = {
      selectedNodeIds,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      console.log(
        '✅ CheckboxTreePersistenceService: Successfully saved state to localStorage',
      );
    } catch (error) {
      console.error(
        '❌ CheckboxTreePersistenceService: Failed to save state:',
        error,
      );
    }

    // Simulate network delay for demo purposes
    return of(void 0).pipe(delay(100));
  }

  /**
   * Load the saved selected node IDs from storage
   * @returns Observable with the saved state or null if no state exists
   */
  loadSelectedNodes(): Observable<CheckboxTreeSavedState | null> {
    console.log(
      '🔄 CheckboxTreePersistenceService: Loading saved nodes from storage',
    );

    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);

      if (!savedData) {
        console.log('ℹ️ CheckboxTreePersistenceService: No saved state found');
        return of(null).pipe(delay(50));
      }

      const state: CheckboxTreeSavedState = JSON.parse(savedData);

      console.log(
        '✅ CheckboxTreePersistenceService: Successfully loaded state:',
        {
          selectedCount: state.selectedNodeIds.length,
          selectedNodes: state.selectedNodeIds,
          savedAt: new Date(state.timestamp).toLocaleString(),
        },
      );

      return of(state).pipe(delay(50));
    } catch (error) {
      console.error(
        '❌ CheckboxTreePersistenceService: Failed to load state:',
        error,
      );
      return of(null).pipe(delay(50));
    }
  }

  /**
   * Clear the saved state from storage
   * @returns Observable that completes when clear is done
   */
  clearSavedState(): Observable<void> {
    console.log('🔄 CheckboxTreePersistenceService: Clearing saved state');

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log(
        '✅ CheckboxTreePersistenceService: Successfully cleared saved state',
      );
    } catch (error) {
      console.error(
        '❌ CheckboxTreePersistenceService: Failed to clear state:',
        error,
      );
    }

    return of(void 0).pipe(delay(50));
  }

  /**
   * Check if there is any saved state
   * @returns Observable with boolean indicating if saved state exists
   */
  hasSavedState(): Observable<boolean> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      const hasState = !!savedData;

      console.log(
        'ℹ️ CheckboxTreePersistenceService: Has saved state:',
        hasState,
      );
      return of(hasState);
    } catch (error) {
      console.error(
        '❌ CheckboxTreePersistenceService: Failed to check saved state:',
        error,
      );
      return of(false);
    }
  }
}

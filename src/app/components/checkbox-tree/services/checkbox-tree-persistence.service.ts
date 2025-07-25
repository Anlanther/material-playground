import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { CheckboxTreeSavedState } from '../models/checkbox-tree-saved-state.model';

@Injectable({
  providedIn: 'root',
})
export class CheckboxTreePersistenceService {
  private readonly STORAGE_KEY = 'checkbox-tree-state';

  /**
   * Save the selected node IDs to storage
   */
  saveSelectedNodes(selectedNodeIds: string[]): Observable<void> {
    const state: CheckboxTreeSavedState = {
      selectedNodeIds,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save checkbox tree state:', error);
    }

    return of(void 0).pipe(delay(100));
  }

  /**
   * Load the saved selected node IDs from storage
   */
  loadSelectedNodes(): Observable<CheckboxTreeSavedState | null> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      const state = savedData ? JSON.parse(savedData) : null;
      return of(state).pipe(delay(50));
    } catch (error) {
      console.error('Failed to load checkbox tree state:', error);
      return of(null).pipe(delay(50));
    }
  }

  /**
   * Clear the saved state from storage
   */
  clearSavedState(): Observable<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear checkbox tree state:', error);
    }

    return of(void 0).pipe(delay(50));
  }

  /**
   * Check if there is any saved state
   */
  hasSavedState(): Observable<boolean> {
    try {
      return of(!!localStorage.getItem(this.STORAGE_KEY));
    } catch (error) {
      console.error('Failed to check saved state:', error);
      return of(false);
    }
  }
}

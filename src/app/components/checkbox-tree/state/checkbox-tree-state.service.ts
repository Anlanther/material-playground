import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentStore } from '@ngrx/component-store';
import {
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  Observable,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CreateFilterComponent } from '../components/state-manager/dialogs/create-filter/create-filter.component';
import { UpdateFilterComponent } from '../components/state-manager/dialogs/update-filter/update-filter.component';
import { DataSource, SavedStates, StateSnapshot } from '../models';
import { DataStateService } from '../services/data-state.service';
import { CheckboxTreeState, DEFAULT_STATE } from './checkbox-tree-state';

@Injectable({ providedIn: 'root' })
export class CheckboxTreeStateService extends ComponentStore<CheckboxTreeState> {
  private dataStateService = inject(DataStateService);
  private matDialog = inject(MatDialog);

  readonly treeNodes$ = this.select((state) => state.treeData);
  readonly activeSavedState$ = this.select((state) => state.savedStates).pipe(
    map((savedStates) =>
      savedStates.states.find((s) => s.id === savedStates.selectedId),
    ),
  );
  readonly savedStates$ = this.select((state) => state.savedStates);
  readonly selectedFiltersForEmission$ = this.select(
    (state) => state.treeData,
  ).pipe(
    map((treeData) => this.dataStateService.convertToSelectedFilter(treeData)),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  constructor() {
    super(DEFAULT_STATE);
  }

  readonly setTreeData = this.updater((state, dataSource: DataSource) => {
    console.log('setTreeData called with dataSource:', dataSource);
    const convertedData =
      this.dataStateService.convertDataToTreeData(dataSource);
    console.log('Converted data length:', convertedData.length);
    return {
      ...state,
      originalTreeData: convertedData,
      treeData: convertedData,
    };
  });

  readonly setTreeDataFromSavedState = this.updater(
    (state, savedState: StateSnapshot) => ({
      ...state,
      originalTreeData: savedState.treeData,
      treeData: savedState.treeData,
      savedStates: {
        ...state.savedStates,
        selectedId: savedState.id,
      },
    }),
  );

  readonly updateExpandedForNode = this.updater((state, nodeId: string) => ({
    ...state,
    treeData: this.dataStateService.updateNodeExpansion(state.treeData, nodeId),
    originalTreeData: this.dataStateService.updateNodeExpansion(
      state.originalTreeData,
      nodeId,
    ),
  }));

  readonly updateNodeCheckboxState = this.updater((state, nodeId: string) => {
    const updatedTreeData = this.dataStateService.updateCheckboxStates(
      state.treeData,
      nodeId,
    );
    const updatedOriginalTreeData = this.dataStateService.updateCheckboxStates(
      state.originalTreeData,
      nodeId,
    );
    return {
      ...state,
      originalTreeData: updatedOriginalTreeData,
      treeData: updatedTreeData,
    };
  });

  readonly setSavedStates = this.updater((state, savedStates: SavedStates) => ({
    ...state,
    savedStates,
  }));

  readonly addSavedState = this.updater(
    (state, newSavedState: StateSnapshot) => ({
      ...state,
      savedStates: {
        selectedId: newSavedState.id,
        states: [...state.savedStates.states, newSavedState],
      },
    }),
  );

  readonly deleteFilterState = this.updater((state, stateId: string) => ({
    ...state,
    savedStates: {
      ...state.savedStates,
      states: state.savedStates.states.filter((s) => s.id !== stateId),
    },
  }));

  readonly updateActiveSavedState = this.updater(
    (state, savedStateId: string | null) => {
      if (!savedStateId) {
        return {
          ...state,
          savedStates: {
            ...state.savedStates,
            selectedId: savedStateId,
          },
        };
      }
      const activeSavedState = state.savedStates.states.find(
        (s) => s.id === savedStateId,
      );
      if (!activeSavedState) {
        return {
          ...state,
        };
      }
      return {
        ...state,
        treeData: activeSavedState.treeData,
        originalTreeData: activeSavedState.treeData,
        savedStates: {
          ...state.savedStates,
          selectedId: savedStateId,
        },
      };
    },
  );

  readonly updateCurrentFilterSnapshot = this.updater((state) => {
    return {
      ...state,
      savedStates: {
        ...state.savedStates,
        states: state.savedStates.states.map((s) => {
          const activeFilter = s.id === state.savedStates.selectedId;
          if (activeFilter) {
            return {
              ...s,
              treeData: state.treeData,
            };
          }
          return s;
        }),
      },
    };
  });

  readonly updateSearchQuery = this.updater((state, query: string) => {
    if (query === '') {
      return {
        ...state,
        treeData: state.originalTreeData,
        search: {
          ...state.search,
          query,
        },
      };
    }
    const filteredData = this.dataStateService.filterTreeData(
      state.originalTreeData,
      query.toLowerCase(),
    );
    return {
      ...state,
      treeData: filteredData,
      search: {
        ...state.search,
        query,
      },
    };
  });

  readonly initialiseStateEffect = this.effect(
    (
      trigger$: Observable<{
        dataSource: DataSource;
        savedStates?: SavedStates;
      }>,
    ) =>
      trigger$.pipe(
        tap(({ dataSource, savedStates }) => {
          if (!savedStates) {
            this.setTreeData(dataSource);
            return;
          }

          const activeSavedState = savedStates.states.find(
            (state) => state.id === savedStates.selectedId,
          );

          if (!activeSavedState || savedStates.selectedId === null) {
            this.setTreeData(dataSource);
            this.setSavedStates(savedStates);
            return;
          }

          this.setSavedStates(savedStates);
          this.updateActiveSavedState(activeSavedState.id);
        }),
      ),
  );

  readonly saveAsNewFilterEffect = this.effect((trigger$) =>
    trigger$.pipe(
      exhaustMap(() => {
        const dialogRef = this.matDialog.open(CreateFilterComponent);
        return dialogRef.afterClosed();
      }),
      filter((result: { name: string }) => !!result),
      withLatestFrom(this.treeNodes$),
      map(([result, treeNodes]) => {
        const newSavedState: StateSnapshot = {
          id: crypto.randomUUID(),
          name: result.name,
          treeData: treeNodes,
        };
        this.addSavedState(newSavedState);
        this.setTreeDataFromSavedState(newSavedState);
        return;
      }),
    ),
  );

  readonly openFilterManagerEffect = this.effect((trigger$) =>
    trigger$.pipe(
      exhaustMap(() => {
        const dialogRef = this.matDialog.open(UpdateFilterComponent);
        return dialogRef.afterClosed();
      }),
    ),
  );
}

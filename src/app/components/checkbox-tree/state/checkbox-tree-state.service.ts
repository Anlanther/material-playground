import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';
import { DataSource, SavedStates, TreeNode } from '../models';
import { DataStateService } from '../services/data-state.service';
import { CheckboxTreeState, DEFAULT_STATE } from './checkbox-tree-state';

@Injectable({ providedIn: 'root' })
export class CheckboxTreeStateService extends ComponentStore<CheckboxTreeState> {
  private dataStateService = inject(DataStateService);

  readonly treeNodes$ = this.select((state) => state.treeData).pipe(
    tap((treeData) => console.log('Tree Data Updated:', treeData)),
  );

  constructor() {
    super(DEFAULT_STATE);
  }

  readonly setTreeData = this.updater((state, dataSource: DataSource) => ({
    ...state,
    originalTreeData: this.dataStateService.convertDataToTreeData(dataSource),
    treeData: this.dataStateService.convertDataToTreeData(dataSource),
  }));

  readonly updateExpandedForNode = this.updater((state, node: TreeNode) => {
    node.isExpanded = !node.isExpanded;
    return state;
  });

  readonly updateNodeCheckboxState = this.updater((state, node: TreeNode) => {
    this.dataStateService.updateParentChildCheckboxState(node);
    return state;
  });

  readonly setSavedStates = this.updater((state, savedStates: SavedStates) => ({
    ...state,
    savedStates,
  }));

  readonly initialiseStateEffect = this.effect(
    (
      trigger$: Observable<{
        dataSource: DataSource;
        savedStates: SavedStates;
      }>,
    ) =>
      trigger$.pipe(
        tap(({ dataSource, savedStates }) => {
          const activeSavedState = savedStates.states.find(
            (state) => state.id === savedStates.selectedId,
          );

          if (!activeSavedState || savedStates.selectedId === null) {
            this.setTreeData(dataSource);
            this.setSavedStates(savedStates);
            return;
          }

          this.setSavedStates(savedStates);
          this.setTreeData(activeSavedState.treeData);
        }),
      ),
  );

  // this.updater(
  //   (state, data: { dataSource: DataSource; savedStates: SavedStates }) => ({
  //     ...state,
  //   }),
  // );
}

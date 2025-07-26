import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';
import { DataSource, TreeNode } from '../models';
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
}

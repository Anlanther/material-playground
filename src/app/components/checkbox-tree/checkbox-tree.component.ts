import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../modules/material.module';
import { FilterComponent } from './components/filter/filter.component';
import { StateManagerComponent } from './components/state-manager/state-manager.component';
import { DataSource, SavedStates, TreeNode } from './models';
import { SelectedFilters } from './models/selected-filter.model';
import { CheckboxTreeStateService } from './state/checkbox-tree-state.service';

@Component({
  selector: 'app-checkbox-tree',
  imports: [
    CommonModule,
    MaterialModule,
    StateManagerComponent,
    FilterComponent,
  ],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
})
export class CheckboxTreeComponent implements OnInit, OnDestroy {
  dataSource = input.required<DataSource>();
  showFilter = input<boolean>(true);
  indentionStep = input<number>(16);
  savedStates = input<SavedStates>();
  selectedFilters = output<SelectedFilters>();

  stateService = inject(CheckboxTreeStateService);

  treeNodes$ = this.stateService.treeNodes$;
  selectedFiltersForEmission$ = this.stateService.selectedFiltersForEmission$;

  private subs = new Subscription();

  ngOnInit() {
    this.stateService.initialiseStateEffect({
      dataSource: this.dataSource(),
      savedStates: this.savedStates(),
    });

    this.subs.add(
      this.selectedFiltersForEmission$.subscribe((filters) => {
        this.selectedFilters.emit(filters);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getNodePadding(level: number): string {
    return `${level * this.indentionStep()}px`;
  }

  trackByNodeId(node: TreeNode): string {
    return node.id;
  }

  toggleExpansion(node: TreeNode): void {
    this.stateService.updateExpandedForNode(node.id);
  }

  toggleSelection(node: TreeNode): void {
    this.stateService.updateNodeCheckboxState(node.id);
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { MaterialModule } from '../../../../modules/material.module';
import { CheckboxTreeStateService } from '../../state/checkbox-tree-state.service';

interface CategoryDisplayState {
  [categoryId: string]: boolean;
}

@Component({
  selector: 'app-summary',
  imports: [CommonModule, MaterialModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  private stateService = inject(CheckboxTreeStateService);

  categoryDisplayState: CategoryDisplayState = {};

  selectedFilters$ = this.stateService.selectedFiltersForEmission$.pipe(
    map((filters) =>
      Object.entries(filters)
        .filter(([, items]) => items.length > 0)
        .map(([, items]) => ({
          itemId: items[0].id,
          rootName: items[0].rootName,
          rootId: items[0].rootId,
          items: items.map((item) => item.name),
        })),
    ),
  );

  toggleCategoryDisplay(categoryId: string) {
    this.categoryDisplayState = {
      ...this.categoryDisplayState,
      [categoryId]: !this.categoryDisplayState[categoryId],
    };
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { FILTER_INPUT } from '../../constants/dummy-data/fund-input-dummy';
import { WorkspaceName } from '../../constants/workspace-name.enum';
import { WidgetInput } from '../../models/widget-input.model';
import { CheckboxTreeComponent } from '../checkbox-tree/checkbox-tree.component';
import { MOCK_DATA_SOURCE } from '../checkbox-tree/dummy-data/data-source.mock';
import { ColorShowcaseComponent } from '../color-showcase/color-showcase.component';
import { FormFilterModule } from '../form-filter/form-filter.module';
import { SavedFilter } from '../form-filter/models/saved-filter.model';
import { WorkspaceSelectorComponent } from '../workspace-selector/workspace-selector.component';

@Component({
  selector: 'app-grid-container',
  imports: [
    CommonModule,
    WorkspaceSelectorComponent,
    FormFilterModule,
    ColorShowcaseComponent,
    CheckboxTreeComponent,
  ],
  templateUrl: './grid-container.component.html',
  styleUrl: './grid-container.component.scss',
  standalone: true,
})
export class GridContainerComponent {
  private route = inject(ActivatedRoute);

  workspaceName$ = this.route.params.pipe(map((params) => params['workspace']));

  filterState = signal<WidgetInput>(FILTER_INPUT);

  get workspace() {
    return WorkspaceName;
  }

  get dataSource() {
    return MOCK_DATA_SOURCE;
  }

  updateSavedState(savedState: SavedFilter) {
    this.filterState.update((state) => ({
      ...state,
      state: savedState,
    }));

    console.log('Saved state:', savedState);
  }
}

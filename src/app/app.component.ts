import { Component, signal } from '@angular/core';
import { FILTER_INPUT } from './dummy-data/fund-input-dummy';
import { FormFilterModule } from './form-filter/form-filter.module';
import { SavedFilter } from './form-filter/models/saved-filter.model';
import { WidgetInput } from './models/widget-input.model';

@Component({
  selector: 'app-root',
  imports: [FormFilterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  filterState = signal<WidgetInput>(FILTER_INPUT);

  updateSavedState(savedState: SavedFilter) {
    this.filterState.update((state) => ({
      ...state,
      state: savedState,
    }));

    console.log('Saved state:', savedState);
  }
}

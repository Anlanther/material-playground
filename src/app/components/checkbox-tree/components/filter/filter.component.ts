import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MaterialModule } from '../../../../modules/material.module';
import { CheckboxTreeStateService } from '../../state/checkbox-tree-state.service';

const DEBOUNCE_TIME = 300;

@Component({
  selector: 'app-filter',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnDestroy {
  private subs = new Subscription();
  private stateService = inject(CheckboxTreeStateService);

  filterForm: FormControl<string> = new FormControl('', {
    nonNullable: true,
  });

  constructor() {
    this.subs.add(
      this.filterForm.valueChanges
        .pipe(debounceTime(DEBOUNCE_TIME), distinctUntilChanged())
        .subscribe((query) => {
          this.stateService.updateSearchQuery(query);
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

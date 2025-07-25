import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MaterialModule } from '../../../../modules/material.module';
import { CheckboxTreeStore } from '../../store/checkbox-tree.store';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  searchControl = new FormControl<string>('');

  store = inject(CheckboxTreeStore);

  subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.searchControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((searchTerm) => {
          this.store.setSearchTerm(searchTerm || '');
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onClearSearch(): void {
    this.searchControl.setValue('');
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../../../modules/material.module';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
})
export class SearchFilterComponent {
  @Input() searchControl!: FormControl;
  @Input() showSearchFilter: boolean = true;
  @Output() clearSearch = new EventEmitter<void>();

  onClearSearch(): void {
    this.clearSearch.emit();
  }
}

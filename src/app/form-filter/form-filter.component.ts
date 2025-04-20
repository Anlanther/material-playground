import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-form-filter',
  imports: [MatSelectModule],
  templateUrl: './form-filter.component.html',
  styleUrl: './form-filter.component.scss',
})
export class FormFilterComponent {
  constructor() {
    this.initialiseFilters();
  }

  initialiseFilters() {}
}

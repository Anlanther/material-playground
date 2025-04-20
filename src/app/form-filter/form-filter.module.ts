import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CountryFilterComponent } from './components/country-filter/country-filter.component';
import { FormFilterComponent } from './form-filter.component';

@NgModule({
  declarations: [FormFilterComponent, CountryFilterComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [FormFilterComponent, CountryFilterComponent],
})
export class FormFilterModule {}

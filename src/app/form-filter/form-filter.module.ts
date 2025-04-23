import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { CompanyFilterComponent } from './components/company-filter/company-filter.component';
import { CountryFilterComponent } from './components/country-filter/country-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { IndustryFilterComponent } from './components/industry-filter/industry-filter.component';
import { FormFilterComponent } from './form-filter.component';

@NgModule({
  declarations: [
    FormFilterComponent,
    CountryFilterComponent,
    DateFilterComponent,
    IndustryFilterComponent,
    CompanyFilterComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  exports: [FormFilterComponent, CountryFilterComponent, DateFilterComponent],
})
export class FormFilterModule {}

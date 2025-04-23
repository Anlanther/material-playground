import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatIconModule,
    MatChipsModule,
  ],
  exports: [FormFilterComponent, CountryFilterComponent, DateFilterComponent],
  providers: [provideNativeDateAdapter()],
})
export class FormFilterModule {}

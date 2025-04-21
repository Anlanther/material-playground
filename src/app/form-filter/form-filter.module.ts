import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CountryFilterComponent } from './components/country-filter/country-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { FormFilterComponent } from './form-filter.component';

@NgModule({
  declarations: [
    FormFilterComponent,
    CountryFilterComponent,
    DateFilterComponent,
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
  ],
  exports: [FormFilterComponent, CountryFilterComponent, DateFilterComponent],
  providers: [provideNativeDateAdapter()],
})
export class FormFilterModule {}

import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { COMPANY_FILTER_OPTIONS } from '../../dummy-data/company-data.constant';

@Component({
  standalone: false,
  selector: 'app-company-filter',
  templateUrl: './company-filter.component.html',
  styleUrl: './company-filter.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class CompanyFilterComponent implements OnInit, OnDestroy {
  controlKey = input.required<string>();
  parentContainer = inject(ControlContainer);

  options: string[] = [];
  filteredOptions: string[] = [];
  selectedOptions: string[] = [];

  subs = new Subscription();
  inputForm = new FormControl('', { nonNullable: true });

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  constructor() {
    this.subs.add(
      of(COMPANY_FILTER_OPTIONS).subscribe(
        (options) => (this.options = options),
      ),
    );
  }

  ngOnInit(): void {
    this.initialiseForm();

    this.subs.add(
      this.inputForm.valueChanges.subscribe(() => {
        this.filterOptions();
      }),
    );
  }

  ngOnDestroy() {
    this.parentFormGroup.removeControl(this.controlKey());
    this.subs.unsubscribe();
  }

  initialiseForm() {
    this.parentFormGroup.addControl(
      this.controlKey(),
      new FormControl([], { nonNullable: true }),
    );
  }

  filterOptions() {
    const value = this.inputForm.value?.toLowerCase();

    if (value) {
      this.filteredOptions = this.options.filter(
        (option) =>
          option.toLowerCase().includes(value) &&
          !this.selectedOptions.includes(option),
      );
    } else {
      this.filteredOptions = [];
    }
  }

  removeOption(option: string) {
    this.selectedOptions.push(option);
    this.inputForm.setValue('');
    this.parentFormGroup.controls[this.controlKey()].setValue(
      this.selectedOptions,
    );
    this.filterOptions();
  }

  removeSelected(company: string) {
    this.selectedOptions = this.selectedOptions.filter(
      (option) => option !== company,
    );
    this.parentFormGroup.controls[this.controlKey()].setValue(
      this.selectedOptions,
    );
    this.filterOptions();
  }
}

import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { INDUSTRY_FILTER_OPTIONS } from '../../dummy-data/industry-data.constant';

@Component({
  standalone: false,
  selector: 'app-industry-filter',
  templateUrl: './industry-filter.component.html',
  styleUrl: './industry-filter.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class IndustryFilterComponent implements OnInit, OnDestroy {
  controlKey = input.required<string>();
  parentContainer = inject(ControlContainer);

  options: string[] = [];
  filteredOptions: string[] = [];
  selectedOptions: string[] = [];

  subs = new Subscription();

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  constructor() {
    this.subs.add(
      of(INDUSTRY_FILTER_OPTIONS).subscribe(
        (options) => (this.options = options),
      ),
    );
  }

  ngOnInit(): void {
    this.initialiseForm();

    this.subs.add(
      this.parentFormGroup.controls[this.controlKey()].valueChanges.subscribe(
        () => {
          this.filterOptions();
        },
      ),
    );
  }

  ngOnDestroy() {
    this.parentFormGroup.removeControl(this.controlKey());
    this.subs.unsubscribe();
  }

  initialiseForm() {
    this.parentFormGroup.addControl(
      this.controlKey(),
      new FormControl('', { nonNullable: true }),
    );
  }

  filterOptions() {
    const value =
      this.parentFormGroup.controls[this.controlKey()].value?.toLowerCase();

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
    this.filterOptions();
  }
}

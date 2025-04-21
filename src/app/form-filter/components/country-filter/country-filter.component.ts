import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { COUNTRY_FILTER_OPTIONS } from '../../constants/dummy-data.constant';
import { FilterKey } from '../../constants/filter-key.enum';
import { ActiveFilterConfig } from '../../models/active-filter-config.model';

@Component({
  standalone: false,
  selector: 'app-country-filter',
  templateUrl: './country-filter.component.html',
  styleUrl: './country-filter.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class CountryFilterComponent implements OnInit, OnDestroy {
  controlKey = input.required<string>();
  defaultValue = input<ActiveFilterConfig>();
  parentContainer = inject(ControlContainer);

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  get countries() {
    return COUNTRY_FILTER_OPTIONS;
  }

  ngOnInit(): void {
    const defaultValue = this.defaultValue();
    if (!defaultValue) {
      this.parentFormGroup.addControl(
        this.controlKey(),
        new FormControl([], { nonNullable: true }),
      );
      return;
    }
    if (defaultValue.filterForm.key === FilterKey.Country) {
      this.parentFormGroup.addControl(
        this.controlKey(),
        new FormControl(defaultValue.filterForm[FilterKey.Country], {
          nonNullable: true,
        }),
      );
    }
  }

  ngOnDestroy() {
    this.parentFormGroup.removeControl(this.controlKey());
  }
}

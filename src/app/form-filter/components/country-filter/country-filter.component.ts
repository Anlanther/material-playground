import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { COUNTRY_FILTER_OPTIONS } from '../../constants/dummy-data.constant';

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
  parentContainer = inject(ControlContainer);

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  get countries() {
    return COUNTRY_FILTER_OPTIONS;
  }

  ngOnInit(): void {
    this.parentFormGroup.addControl(
      this.controlKey(),
      new FormControl([], { nonNullable: true }),
    );
  }

  ngOnDestroy() {
    this.parentFormGroup.removeControl(this.controlKey());
  }
}

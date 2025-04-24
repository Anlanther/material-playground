import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-rating-filter',
  templateUrl: './rating-filter.component.html',
  styleUrl: './rating-filter.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class RatingFilterComponent implements OnInit, OnDestroy {
  controlKey = input.required<string>();
  parentContainer = inject(ControlContainer);

  subs = new Subscription();

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  constructor() {}

  ngOnInit(): void {
    this.initialiseForm();
  }

  ngOnDestroy() {
    this.parentFormGroup.removeControl(this.controlKey());
    this.subs.unsubscribe();
  }

  initialiseForm() {
    this.parentFormGroup.addControl(
      this.controlKey(),
      new FormGroup({
        a: new FormControl(false),
        b: new FormControl(false),
        c: new FormControl(false),
      }),
    );
  }
}

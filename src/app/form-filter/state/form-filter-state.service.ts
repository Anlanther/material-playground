import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { DEFAULT_STATE, FormFilterState } from './form-filter-state';

@Injectable({
  providedIn: 'root',
})
export class FormFilterStore extends ComponentStore<FormFilterState> {
  constructor() {
    super(DEFAULT_STATE);
  }
}

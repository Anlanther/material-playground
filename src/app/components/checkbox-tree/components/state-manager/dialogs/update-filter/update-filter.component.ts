import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { StateSnapshot } from '../../../../models';
import { CheckboxTreeStateService } from '../../../../state/checkbox-tree-state.service';

@Component({
  selector: 'app-update-filter',
  standalone: false,
  templateUrl: './update-filter.component.html',
  styleUrl: './update-filter.component.scss',
})
export class UpdateFilterComponent {
  private dialogRef = inject(MatDialogRef<UpdateFilterComponent>);
  private state = inject(CheckboxTreeStateService);

  savedStates$ = this.state.savedStates$;
  activeSavedState$ = this.state.activeSavedState$;

  filterNameForm: FormControl<string> = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  isEditing = false;

  editFilterName(savedState: StateSnapshot) {
    this.filterNameForm.setValue(savedState.name);
    this.isEditing = true;
  }

  deleteFilter(savedState: StateSnapshot) {
    this.state.deleteFilterState(savedState.id);
  }

  setActive(savedState: StateSnapshot) {
    this.state.updateActiveSavedState(savedState.id);
  }

  deactivateFilter() {
    this.state.updateActiveSavedState(null);
  }

  close() {
    this.dialogRef.close();
  }
}

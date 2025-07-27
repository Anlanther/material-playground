import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-filter',
  templateUrl: './create-filter.component.html',
  styleUrl: './create-filter.component.scss',
  standalone: false,
})
export class CreateFilterComponent {
  private dialogRef = inject(MatDialogRef<CreateFilterComponent>);

  filterForm: FormControl<string> = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  confirm() {
    if (this.filterForm.valid) {
      this.dialogRef.close({ name: this.filterForm.value });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

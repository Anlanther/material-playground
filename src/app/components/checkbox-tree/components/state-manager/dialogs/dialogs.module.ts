import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../../modules/material.module';
import { CreateFilterComponent } from './create-filter/create-filter.component';
import { UpdateFilterComponent } from './update-filter/update-filter.component';

@NgModule({
  declarations: [CreateFilterComponent, UpdateFilterComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  exports: [CreateFilterComponent, UpdateFilterComponent],
})
export class DialogsModule {}

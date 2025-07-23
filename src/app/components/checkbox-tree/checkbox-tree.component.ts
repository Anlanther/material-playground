import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material.module';

@Component({
  selector: 'app-checkbox-tree',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
})
export class CheckboxTreeComponent {}

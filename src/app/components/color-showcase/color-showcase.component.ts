import { Component } from '@angular/core';
import { MaterialModule } from '../../modules/material.module';

@Component({
  selector: 'app-color-showcase',
  imports: [MaterialModule],
  templateUrl: './color-showcase.component.html',
  styleUrl: './color-showcase.component.scss',
})
export class ColorShowcaseComponent {}

import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material.module';
import { DiscoveryTableComponent } from './discovery-table/discovery-table.component';

@Component({
  selector: 'app-workspace-selector',
  imports: [
    MaterialModule,
    DiscoveryTableComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './workspace-selector.component.html',
  styleUrl: './workspace-selector.component.scss',
})
export class WorkspaceSelectorComponent {
  form = new FormControl('');

  toggleTheme() {}
}

import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material.module';
import { ThemeService } from '../../services/theme.service';
import { TabShowcaseComponent } from './tab-showcase/tab-showcase.component';

@Component({
  selector: 'app-workspace-selector',
  imports: [
    MaterialModule,
    // DiscoveryTableComponent,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    TabShowcaseComponent,
  ],
  templateUrl: './workspace-selector.component.html',
  styleUrl: './workspace-selector.component.scss',
})
export class WorkspaceSelectorComponent {
  form = new FormControl('');
  isDarkTheme$;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}

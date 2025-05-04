import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WORKSPACES } from '../../constants/workspaces.constant';
import { MaterialModule } from '../../modules/material.module';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    MaterialModule,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  readonly isDarkTheme$;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  get workspaces() {
    return WORKSPACES;
  }
}

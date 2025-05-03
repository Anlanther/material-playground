import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WORKSPACES } from '../../constants/workspaces.constant';
import { MaterialModule } from '../../modules/material.module';

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
  get workspaces() {
    return WORKSPACES;
  }
}

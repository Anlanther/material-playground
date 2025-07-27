import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material.module';
import { CheckboxTreeStateService } from '../../state/checkbox-tree-state.service';
import { DialogsModule } from './dialogs/dialogs.module';

@Component({
  selector: 'app-state-manager',
  imports: [CommonModule, MaterialModule, DialogsModule],
  templateUrl: './state-manager.component.html',
  styleUrl: './state-manager.component.scss',
})
export class StateManagerComponent {
  state = inject(CheckboxTreeStateService);

  activeFilter$ = this.state.activeSavedState$;

  saveAsNewFilter(): void {
    this.state.saveAsNewFilterEffect();
  }

  openFilterManager(): void {
    this.state.openFilterManagerEffect();
  }

  updateCurrentFilterSnapshot(): void {
    this.state.updateCurrentFilterSnapshot();
  }
}

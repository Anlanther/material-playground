import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { MaterialModule } from '../../../../modules/material.module';

@Component({
  selector: 'app-selected-items',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './selected-items.component.html',
  styleUrls: ['./selected-items.component.scss'],
})
export class SelectedItemsComponent {
  @Input() selectedNodes: string[] = [];
  @Input() selectedCount$!: Observable<number>;
  @Input() maxChildHeight: string = '300px';
  @Input() showSelectedItems: boolean = true;

  /**
   * Track function for selected items
   */
  trackBySelectedItem(index: number, item: string): string {
    return item;
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { MaterialModule } from '../../modules/material.module';
import { DataSource, SavedStates, TreeNode } from './models';
import { CheckboxTreeStateService } from './state/checkbox-tree-state.service';

@Component({
  selector: 'app-checkbox-tree',
  imports: [CommonModule, MaterialModule],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
})
export class CheckboxTreeComponent implements OnInit {
  dataSource = input.required<DataSource>();
  showFilter = input<boolean>(true);
  indentionStep = input<number>(16);
  savedStates = input<SavedStates>();

  stateService = inject(CheckboxTreeStateService);

  treeNodes$ = this.stateService.treeNodes$;

  ngOnInit() {
    this.stateService.setTreeData(this.dataSource());
  }

  getNodePadding(level: number): string {
    return `${level * this.indentionStep()}px`;
  }

  trackByNodeId(node: TreeNode): string {
    return node.id;
  }

  toggleExpansion(node: TreeNode): void {
    this.stateService.updateExpandedForNode(node.id);
  }

  toggleSelection(node: TreeNode): void {
    this.stateService.updateNodeCheckboxState(node.id);
  }
}

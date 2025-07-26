import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material.module';
import { DataSource, TreeNode } from './models';
import { CheckboxTreeStateService } from './state/checkbox-tree-state.service';

@Component({
  selector: 'app-checkbox-tree',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './checkbox-tree.component.html',
  styleUrls: ['./checkbox-tree.component.scss'],
})
export class CheckboxTreeComponent implements OnInit {
  dataSource = input.required<DataSource>();
  showFilter = input<boolean>(true);
  baseNodePaddingPxl = input<number>(10);
  indentionStep = input<number>(20);

  stateService = inject(CheckboxTreeStateService);

  treeNodes$ = this.stateService.treeNodes$;

  ngOnInit() {
    this.stateService.setTreeData(this.dataSource());
  }

  getNodePadding(level: number): string {
    const indentLevel = level - 1;
    return `${indentLevel * this.indentionStep() + this.baseNodePaddingPxl()}px`;
  }

  trackByNodeId(node: TreeNode): string {
    return node.id;
  }

  toggleExpansion(node: TreeNode): void {
    this.stateService.updateExpandedForNode(node);
  }

  toggleSelection(node: TreeNode): void {
    this.stateService.updateNodeCheckboxState(node);
  }
}

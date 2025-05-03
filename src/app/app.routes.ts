import { Routes } from '@angular/router';
import { GridContainerComponent } from './components/grid-container/grid-container.component';
import { MainComponent } from './views/main/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: ':workspace',
        component: GridContainerComponent,
      },
    ],
  },
];

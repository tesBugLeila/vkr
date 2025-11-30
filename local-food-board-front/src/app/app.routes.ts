import { Routes } from '@angular/router';
import { List } from './components/list/list';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: List,
  },
  {
    path: 'login',
    component: List,
  },
]

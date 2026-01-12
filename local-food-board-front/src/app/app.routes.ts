import { Routes } from '@angular/router';
import { List } from './components/list/list';
import { PostEdit } from './components/post-edit/post-edit';
import { Login } from './components/login/login';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: List,
  },
  {
    path: 'new',
    component: PostEdit,
  },
  {
    path: 'login',
    component: Login,
  },
];

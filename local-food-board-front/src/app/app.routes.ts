import { Routes } from '@angular/router';
import { List } from './components/list/list';
import { PostEdit } from './components/post-edit/post-edit';
import { Login } from './components/login/login';
import { Health } from './components/health/health';
import { Post } from './components/post/post';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: List,
  },
  {
    path: 'post/:id',
    component: Post,
  },
  {
    path: 'health',
    component: Health,
  },
  {
    path: 'edit/:id',
    component: PostEdit,
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

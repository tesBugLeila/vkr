import { Routes } from '@angular/router';
import { List } from './components/list/list';
import { PostEdit } from './components/post-edit/post-edit';
import { Login } from './components/login/login';
import { Health } from './components/health/health';
import { Post } from './components/post/post';
import { Admin } from './components/admin/admin';
import { Profile } from './components/profile/profile';
import { Notifications } from './components/notifications/notifications';

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
  {
    path: 'admin',
    component: Admin,
  },
  {
    path: 'profile',
    component: Profile,
  },

   {
    path: 'notifications',
    component: Notifications,
  },


];
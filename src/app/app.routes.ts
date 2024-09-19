import { Routes } from '@angular/router';
import { userResolver } from './users/core/user.resolver';
import { canDeactivateGuard } from './users/core/guards/deactivate.guard';

export const routes: Routes = [
  {
    path: '',
    resolve: { users: userResolver },
    loadComponent: () =>
      import('./users/users.component').then((mod) => mod.UsersComponent),
  },
  {
    path: 'form',
    resolve: { users: userResolver },
    canDeactivate: [canDeactivateGuard],
    loadComponent: () =>
      import('./users/components/user-form/user-form.component').then(
        (mod) => mod.UserFormComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

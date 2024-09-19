import { CanDeactivateFn, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserFormComponent } from '../../components/user-form/user-form.component';

export type CanDeactivateType =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree;

export const canDeactivateGuard: CanDeactivateFn<UserFormComponent> = (
  component: UserFormComponent,
) => {
  if (component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Do you really want to leave?');
  }
  return true;
};
